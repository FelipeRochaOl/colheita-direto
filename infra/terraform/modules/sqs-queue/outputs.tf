output "queue_url" { value = aws_sqs_queue.main.url }
output "queue_arn" { value = aws_sqs_queue.main.arn }
output "dead_letter_queue_name" { value = aws_sqs_queue.dead_letter.name }
