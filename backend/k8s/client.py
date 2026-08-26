from kubernetes import client, config


def get_kubernetes_client():
    """
    Load the local kubeconfig and return
    a Kubernetes CoreV1 API client.
    """
    config.load_kube_config()

    return client.CoreV1Api()
