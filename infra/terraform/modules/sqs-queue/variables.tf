variable "name_prefix" { type = string }
variable "queue_name" { type = string }
variable "visibility_timeout_seconds" {
  description = "Maior que o tempo de processamento (classificação, agente Claude, transcrição)"
  type        = number
  default     = 180
}
