variable "name_prefix" { type = string }
variable "repository_names" { type = list(string) }
variable "force_delete" {
  description = "Apaga o repositório mesmo com imagens (true só em ambiente descartável)"
  type        = bool
  default     = false
}
