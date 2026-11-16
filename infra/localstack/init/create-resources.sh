#!/bin/sh
# Cria bucket e filas locais usados pela API em desenvolvimento.
awslocal s3 mb s3://colheita-direta-harvest-photos
for queue in harvest-lot-events notification-events; do
  awslocal sqs create-queue --queue-name "$queue-dlq"
  awslocal sqs create-queue --queue-name "$queue" \
    --attributes "{\"RedrivePolicy\":\"{\\\"deadLetterTargetArn\\\":\\\"arn:aws:sqs:us-east-1:000000000000:$queue-dlq\\\",\\\"maxReceiveCount\\\":\\\"3\\\"}\"}"
done

# O navegador e o app enviam fotos direto para o S3 com URL assinada.
awslocal s3api put-bucket-cors --bucket colheita-direta-harvest-photos --cors-configuration '{
  "CORSRules": [{ "AllowedOrigins": ["*"], "AllowedMethods": ["PUT", "GET"], "AllowedHeaders": ["*"], "MaxAgeSeconds": 3600 }]
}'
