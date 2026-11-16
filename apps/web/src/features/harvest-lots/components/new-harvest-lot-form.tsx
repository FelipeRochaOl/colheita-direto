import { CameraOutlined } from '@ant-design/icons';
import { useCreateHarvestLot } from '@colheita/api-client';
import { Alert, Button, Form, Input, InputNumber, Upload, UploadFile } from 'antd';
import { useState } from 'react';

const MAX_PHOTOS = 5;

interface NewHarvestLotFormValues {
  crop: string;
  quantityBoxes: number;
  boxWeightKg: number;
}

/** Produtor fotografa a colheita; a visão computacional classifica em seguida. */
export function NewHarvestLotForm({ onCreated }: { onCreated: () => void }) {
  const [form] = Form.useForm<NewHarvestLotFormValues>();
  const [photoFiles, setPhotoFiles] = useState<UploadFile[]>([]);
  const createHarvestLot = useCreateHarvestLot();

  const handleSubmit = (values: NewHarvestLotFormValues) => {
    const photos = photoFiles
      .map((file) => file.originFileObj)
      .filter((file): file is NonNullable<typeof file> => Boolean(file))
      .map((file) => ({ content: file, contentType: file.type || 'image/jpeg' }));

    createHarvestLot.mutate(
      { ...values, photos },
      {
        onSuccess: () => {
          form.resetFields();
          setPhotoFiles([]);
          onCreated();
        },
      },
    );
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false} initialValues={{ boxWeightKg: 20 }}>
      {createHarvestLot.error && <Alert type="error" showIcon message={createHarvestLot.error.message} className="mb-4!" />}
      <Form.Item label="Fotos do lote (de 1 a 5)" required>
        <Upload
          listType="picture-card"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          fileList={photoFiles}
          beforeUpload={() => false}
          onChange={({ fileList }) => setPhotoFiles(fileList.slice(0, MAX_PHOTOS))}
        >
          {photoFiles.length < MAX_PHOTOS && (
            <div>
              <CameraOutlined className="text-2xl" />
              <div className="mt-1 text-sm">Foto</div>
            </div>
          )}
        </Upload>
      </Form.Item>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4">
        <Form.Item name="crop" label="Produto" rules={[{ required: true, message: 'Qual produto?' }]}>
          <Input placeholder="tomate" size="large" />
        </Form.Item>
        <Form.Item name="quantityBoxes" label="Caixas" rules={[{ required: true, message: 'Quantas caixas?' }]}>
          <InputNumber min={1} size="large" className="w-full!" />
        </Form.Item>
        <Form.Item name="boxWeightKg" label="Peso da caixa (kg)" rules={[{ required: true }]}>
          <InputNumber min={0.5} step={0.5} size="large" className="w-full!" />
        </Form.Item>
      </div>
      <Button type="primary" htmlType="submit" size="large" loading={createHarvestLot.isPending} disabled={!photoFiles.length}>
        Classificar colheita
      </Button>
    </Form>
  );
}
