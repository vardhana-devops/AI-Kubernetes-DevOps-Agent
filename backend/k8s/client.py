from kubernetes import client, config
from kubernetes.config.config_exception import ConfigException


def get_kubernetes_client():
    """
    Return a Kubernetes CoreV1 API client.

    Uses in-cluster ServiceAccount credentials when the application
    is running inside Kubernetes. Falls back to the local kubeconfig
    for local development and Docker-based testing.
    """
    try:
        config.load_incluster_config()
    except ConfigException:
        config.load_kube_config()

    return client.CoreV1Api()
