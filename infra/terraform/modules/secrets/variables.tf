variable "name_prefix" { type = string }
variable "mongodb_uri" {
  type      = string
  sensitive = true
}
variable "recovery_window_in_days" {
  description = "0 apaga na hora (dev, para poder recriar). Em produção use 7 ou mais."
  type        = number
  default     = 7
}
