## Architecture & production (Kubernetes)

Voir `architecture-notes.md` pour les réponses et le raisonnement.

### Déploiement avec Secret (ordre des commandes)

1. Namespace (si besoin) :  
   `kubectl create namespace quote-lab`

2. Secret (à faire avant d’appliquer le Deployment) :  
   ```bash
   kubectl create secret generic quote-db-secret \
     --from-literal=POSTGRES_USER=quote \
     --from-literal=POSTGRES_PASSWORD=quote \
     --from-literal=DATABASE_URL=postgres://quote:quote@localhost:5432/postgres \
     --namespace=quote-lab
   ```

3. ConfigMap init DB :  
   `kubectl apply -f docker/postgres-init-configmap.yaml`

4. PVC pour la persistance Postgres :  
   `kubectl apply -f docker/postgres-pvc.yaml`

5. Deployment et Service :  
   `kubectl apply -f docker/deployment.yaml`  
   `kubectl apply -f docker/service.yaml`

6. Vérification :  
   `kubectl get pods -n quote-lab`  
   `kubectl get services -n quote-lab`

7. Scale (optionnel) :  
   `kubectl scale deployment quote-app -n quote-lab --replicas=3`
