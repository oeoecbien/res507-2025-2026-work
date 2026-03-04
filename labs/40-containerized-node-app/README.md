# Quote App — Lab 40 (conteneurisé) & 85 (Kubernetes)

Application Node.js (citations) avec PostgreSQL, conteneurisée puis déployée sur Kubernetes (namespace `quote-lab`).

- **Documentation lab 85** : voir [architecture-notes.md](architecture-notes.md) pour le raisonnement, le diagramme et les réponses.

---

## Prérequis

- Docker (build de l’image)
- kubectl + cluster Kubernetes (ex. k3s)

---

## Build de l’image

À exécuter depuis la racine de ce lab (`labs/40-containerized-node-app/`) :

```bash
docker build -t quote-app:local -f docker/Dockerfile .
```

Avec k3s/containerd en local, importer l’image si besoin :

```bash
docker save quote-app:local | sudo k3s ctr images import -
```

---

## Déploiement Kubernetes (ordre des commandes)

1. **Namespace** (si besoin) :
   ```bash
   kubectl create namespace quote-lab
   ```

2. **Secret** (obligatoire avant le Deployment) :
   ```bash
   kubectl create secret generic quote-db-secret \
     --from-literal=POSTGRES_USER=quote \
     --from-literal=POSTGRES_PASSWORD=quote \
     --from-literal=DATABASE_URL=postgres://quote:quote@localhost:5432/postgres \
     --namespace=quote-lab
   ```

3. **ConfigMap init DB** :  
   `kubectl apply -f docker/postgres-init-configmap.yaml`

4. **PVC** (persistance Postgres) :  
   `kubectl apply -f docker/postgres-pvc.yaml`

5. **Deployment et Service** :  
   `kubectl apply -f docker/deployment.yaml`  
   `kubectl apply -f docker/service.yaml`

6. **Vérification** :
   ```bash
   kubectl get pods -n quote-lab
   kubectl get services -n quote-lab
   ```

7. **Test en local (port-forward)** :
   ```bash
   kubectl port-forward -n quote-lab svc/quote-app 3000:80
   ```
   Puis ouvrir http://localhost:3000

8. **Scale** (optionnel) :  
   `kubectl scale deployment quote-app -n quote-lab --replicas=3`
