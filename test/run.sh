#!/bin/bash

curl -v -X POST -H "Content-Type: application/json" http://localhost:9000/webhook -d @github-payload
curl -v -X POST -H "Content-Type: application/json" http://localhost:9000/webhook -d @gitlab-payload
