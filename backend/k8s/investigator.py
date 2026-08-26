from kubernetes.client.exceptions import ApiException

from .client import get_kubernetes_client


def get_all_pods():
    try:
        v1 = get_kubernetes_client()
        pods = v1.list_pod_for_all_namespaces(watch=False)

        results = []

        for pod in pods.items:
            results.append({
                "name": pod.metadata.name,
                "namespace": pod.metadata.namespace,
                "status": pod.status.phase,
            })

        return results

    except ApiException as error:
        return {
            "error": str(error)
        }
