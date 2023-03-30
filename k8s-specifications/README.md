# Kubernetes

Table of contents
=================

<!--ts-->
* [Previous Art](#previous-art)
* [Preparation](#preparation)
* [MongoDB](#mongodb)
  * [Post-installation](#post-installation)
* [RabbitMQ](#rabbitmq)
  * [Post-installation](#post-installation-1)
* [Backend](#backend)
* [Worker](#worker)
<!--te-->

## Previous Art

This work is inspired by the following:

 * https://devopscube.com/deploy-mongodb-kubernetes/
 * https://blog.rabbitmq.com/posts/2020/08/deploying-rabbitmq-to-kubernetes-whats-involved/

## Preparation

Install Helm on your Linux distribution and then add the Bitnami repository:

```sh
helm repo add bitnami https://charts.bitnami.com/bitnami
```

Create namespace:

```sh
kubectl apply -f namespace.yaml
```

## MongoDB

Install:

```sh
helm install --namespace voting mongodb --set "auth.rootUser=mongoadmin,auth.rootPassword=secret,nameOverride=mongodb" bitnami/mongodb
```

### Post-installation

You can now access the service with the following DNS name: `mongodb.voting.svc.cluster.local`.

To get the root password run:

```sh
export MONGODB_ROOT_PASSWORD=$(kubectl get secret --namespace voting mongodb -o jsonpath="{.data.mongodb-root-password}" | base64 -d)
```

To connect to your database, create a client container:

```sh
kubectl run --namespace voting mongodb-client --rm --tty -i --restart='Never' --env="MONGODB_ROOT_PASSWORD=$MONGODB_ROOT_PASSWORD" --image docker.io/bitnami/mongodb:6.0.5-debian-11-r1 --command -- bash
```

Then, run the following command:

```sh
mongosh admin --host "mongodb" --authenticationDatabase admin -u root -p $MONGODB_ROOT_PASSWORD
```

To connect to your database from outside the cluster execute the following commands:

```sh
kubectl port-forward --namespace voting svc/mongodb 27017:27017 &
mongosh --host 127.0.0.1 --authenticationDatabase admin -p $MONGODB_ROOT_PASSWORD
```

## RabbitMQ

Install:

```sh
helm install --namespace voting rabbitmq --set "auth.username=guest,auth.password=guest,nameOverride=rabbitmq" bitnami/rabbitmq
```

### Post-installation

You can now access the service with the following DNS name: `rabbitmq.voting.svc.cluster.local`.

Credentials:

```sh
echo "Username      : guest"
echo "Password      : $(kubectl get secret --namespace voting rabbitmq -o jsonpath="{.data.rabbitmq-password}" | base64 -d)"
echo "ErLang Cookie : $(kubectl get secret --namespace voting rabbitmq -o jsonpath="{.data.rabbitmq-erlang-cookie}" | base64 -d)"
```

To access for outside the cluster, perform the following steps:

To Access the RabbitMQ AMQP port:

```sh
echo "URL : amqp://127.0.0.1:5672/"
kubectl port-forward --namespace voting svc/rabbitmq 5672:5672
```

To Access the RabbitMQ Management interface:

```sh
echo "URL : http://127.0.0.1:15672/"
kubectl port-forward --namespace voting svc/rabbitmq 15672:15672
```

## Backend

Install:

```sh
kubectl apply -f backend.yaml
```

## Worker

Install:

```sh
kubectl apply -f worker.yaml
```