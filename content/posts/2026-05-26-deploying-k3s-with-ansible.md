# Deploying K3s with Ansible

I have been spending a lot more time on my homelab lately, and one of the things I wanted to stop doing was rebuilding everything by hand every time I changed machines or wanted to test the setup again.

So I ended up putting this repository together:

[github.com/SergioCltn/k3s-homelab](https://github.com/SergioCltn/k3s-homelab)

The idea is simple: use Ansible to install a `k3s` server, join one or more agent nodes, configure the cluster the way I want, and leave the kubeconfig ready on my local machine.

## Why I used Ansible

What I like about Ansible is that it lets me describe the setup once and then just run it again whenever I need it.

Instead of SSHing into each machine, copying commands from random notes, and hoping I did not forget a step, I can keep the whole setup in code.

For this project, Ansible is basically responsible for:

- connecting to the nodes over SSH
- writing the `k3s` config files
- installing the server and the agents
- reading the join token from the server
- using that token so the workers can join automatically

That last part is what makes it feel really nice. Once the inventory is correct, adding a new node becomes much less manual.

## How the repository is organized

The repository is pretty small, and the important files are easy to follow:

- `inventory/hosts.yml`
- `group_vars/k3s.yml`
- `playbooks/install.yml`
- `playbooks/status.yml`
- `playbooks/uninstall.yml`

The inventory is where I define which machine is the server and which ones are agents. Right now it looks like this:

```yaml
all:
  children:
    k3s:
      children:
        k3s_servers:
        k3s_agents:
    k3s_servers:
      hosts:
        aetherion:
          ansible_host: 192.168.1.134
          ansible_user: aetherion
    k3s_agents:
      hosts:
        aetherion-worker-1:
          ansible_host: 192.168.1.35
          ansible_user: aetherion
```

The separation matters because the server and the agents are installed in different modes.

The server runs the control plane, and the agents are the nodes that join the cluster to run workloads.

## How the install works

The main playbook installs the server first and the agents after that.

On the server side, Ansible does a few things in order:

1. checks that `sudo` works without prompting
2. updates the system if I want that enabled
3. creates `/etc/rancher/k3s`
4. writes `config.yaml` and `registries.yaml`
5. installs `k3s` in server mode
6. waits until the API is ready
7. fetches the kubeconfig and saves it locally
8. reads the node token that agents need to join

The shared variables live in `group_vars/k3s.yml`. A simplified version of what I am using looks like this:

```yaml
k3s_channel: stable
k3s_server_config:
  cluster-init: true
  disable:
    - traefik
    - servicelb
```

So the first server initializes the cluster, and I disable some default components because I prefer managing those myself later.

## How the agents join

This part is probably my favorite because it removes one of the annoying manual steps.

After the server is installed, the playbook reads the join token from:

```text
/var/lib/rancher/k3s/server/node-token
```

Then Ansible stores that value and uses it when installing the agents.

Each agent ends up with a config that points to the server and includes the token, something like this:

```yaml
server: https://192.168.1.134:6443
token: <server-node-token>
```

After that, Ansible installs `k3s` in agent mode, starts `k3s-agent`, and the machine joins the cluster.

So if I want to add another worker, the flow is basically:

1. add the machine to `inventory/hosts.yml`
2. make sure SSH access and `sudo` are working
3. run the install playbook again

That is much better than joining every node manually.

## Running it

Once the inventory is ready, the deployment command is just:

```bash
ansible-playbook -i inventory/hosts.yml playbooks/install.yml
```

To check the cluster status:

```bash
ansible-playbook -i inventory/hosts.yml playbooks/status.yml
```

And to use the kubeconfig fetched by the playbook:

```bash
KUBECONFIG=./kubeconfig/aetherion.yaml kubectl get nodes
```

If everything worked, you should see the server and the agent nodes there.

## Why I like this setup

Before this, rebuilding infrastructure always felt a bit fragile. Even when I knew the steps, it was still easy to miss something small and end up debugging a broken cluster later.

With Ansible, the setup is written down in a way that is actually executable.

The inventory tells me where the machines are, the variables tell me how the cluster should behave, and the playbook describes the installation flow from start to finish.

That makes the homelab easier to maintain, easier to repeat, and easier to grow.

From here I can keep building on top of it with the rest of the platform, like Gitea, a local registry, Pi-hole, `external-dns`, ArgoCD, and the applications I want to deploy.

If you want to see the exact files I am using, the repository is here:

[github.com/SergioCltn/k3s-homelab](https://github.com/SergioCltn/k3s-homelab)
