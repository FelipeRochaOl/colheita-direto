import { RegisterExpenseInput, useRegisterExpense } from '@colheita/api-client';
import { Button, Form, Input, InputNumber, Select } from 'antd';

const EXPENSE_CATEGORY_OPTIONS: Array<{ label: string; value: RegisterExpenseInput['category'] }> = [
  { label: 'Sementes e mudas', value: 'SEEDS' },
  { label: 'Adubo', value: 'FERTILIZER' },
  { label: 'Defensivos', value: 'PESTICIDE' },
  { label: 'Mão de obra', value: 'LABOR' },
  { label: 'Combustível', value: 'FUEL' },
  { label: 'Embalagens', value: 'PACKAGING' },
  { label: 'Equipamentos', value: 'EQUIPMENT' },
  { label: 'Outros', value: 'OTHER' },
];

export function ExpenseForm() {
  const [form] = Form.useForm<RegisterExpenseInput>();
  const registerExpense = useRegisterExpense();

  return (
    <Form
      form={form}
      layout="inline"
      className="gap-y-3"
      onFinish={(values) => registerExpense.mutate(values, { onSuccess: () => form.resetFields() })}
    >
      <Form.Item name="description" rules={[{ required: true, message: 'Descreva' }]}>
        <Input placeholder="Ex.: adubo orgânico" />
      </Form.Item>
      <Form.Item name="category" rules={[{ required: true, message: 'Categoria' }]}>
        <Select placeholder="Categoria" options={EXPENSE_CATEGORY_OPTIONS} className="min-w-44" />
      </Form.Item>
      <Form.Item name="amount" rules={[{ required: true, message: 'Valor' }]}>
        <InputNumber prefix="R$" min={0.01} placeholder="Valor" />
      </Form.Item>
      <Button type="primary" htmlType="submit" loading={registerExpense.isPending}>
        Anotar despesa
      </Button>
    </Form>
  );
}
