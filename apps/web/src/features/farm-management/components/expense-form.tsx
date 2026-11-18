import { RegisterExpenseInput, useRegisterExpense } from '@colheita/api-client';
import { Button, Form, Input, InputNumber, Select } from 'antd';

const EXPENSE_CATEGORY_OPTIONS: Array<{ label: string; value: RegisterExpenseInput['category'] }> =
  [
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
      layout="vertical"
      requiredMark={false}
      onFinish={(values) => registerExpense.mutate(values, { onSuccess: () => form.resetFields() })}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4">
        <Form.Item
          name="description"
          label="Descrição"
          rules={[{ required: true, message: 'Descreva a despesa' }]}
        >
          <Input placeholder="Ex.: adubo orgânico" />
        </Form.Item>
        <Form.Item
          name="category"
          label="Categoria"
          rules={[{ required: true, message: 'Escolha a categoria' }]}
        >
          <Select placeholder="Escolha" options={EXPENSE_CATEGORY_OPTIONS} />
        </Form.Item>
        <Form.Item
          name="amount"
          label="Valor"
          rules={[{ required: true, message: 'Informe o valor' }]}
        >
          <InputNumber prefix="R$" min={0.01} placeholder="0,00" className="w-full!" />
        </Form.Item>
      </div>
      <Button type="primary" htmlType="submit" loading={registerExpense.isPending}>
        Anotar despesa
      </Button>
    </Form>
  );
}
