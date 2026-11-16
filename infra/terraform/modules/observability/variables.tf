variable "name_prefix" { type = string }
variable "alert_email" { type = string }
variable "dead_letter_queue_names" { type = list(string) }
variable "load_balancer_arn_suffix" { type = string }
variable "monthly_budget_usd" {
  type    = number
  default = 150
}
