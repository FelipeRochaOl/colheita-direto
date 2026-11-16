import type { Order } from '@colheita/contracts';
import { MoneyText } from '@colheita/ui-web';
import { Alert, Input, Typography } from 'antd';

/** QR code e "copia e cola" do Pix. O status muda sozinho quando o pagamento cai (polling do React Query). */
export function PixPaymentPanel({ order }: { order: Order }) {
  if (!order.payment) return null;
  return (
    <div className="flex flex-col sm:flex-row gap-6 items-start">
      {order.payment.pixQrCodeImage && (
        <img src={order.payment.pixQrCodeImage} alt="QR code Pix" className="w-48 h-48 border border-border-subtle rounded-sm" />
      )}
      <div className="flex-1 min-w-0">
        <p className="mb-2">
          Total: <MoneyText value={order.total} strong />
        </p>
        {order.payment.pixCopyPaste && (
          <>
            <Typography.Text type="secondary">Pix copia e cola</Typography.Text>
            <Input.TextArea
              readOnly
              autoSize
              value={order.payment.pixCopyPaste}
              onFocus={(event) => event.target.select()}
            />
          </>
        )}
        <Alert className="mt-4!" type="info" showIcon message="Assim que o Pix for pago, o produtor é avisado no WhatsApp." />
      </div>
    </div>
  );
}
