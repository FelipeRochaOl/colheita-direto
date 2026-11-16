import { AudioFilled, CheckOutlined } from '@ant-design/icons';
import { BrandMark, MoneyText, WeightText } from '@colheita/ui-web';
import { ReactNode } from 'react';
import { TomatoCrateIllustration } from './tomato-crate-illustration';

const WAVEFORM_HEIGHTS = [6, 12, 18, 10, 22, 14, 8, 20, 16, 9, 18, 12, 6, 14, 20, 10, 7, 15, 11, 5];

function ProducerBubble({ children, time }: { children: ReactNode; time: string }) {
  return (
    <div className="self-end max-w-[82%] rounded-2xl rounded-br-md bg-mint-strong px-3.5 py-2.5 text-[14px] text-evergreen shadow-sm">
      {children}
      <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-green-dark">
        {time} <CheckOutlined />
        <CheckOutlined className="-ml-1.5" />
      </div>
    </div>
  );
}

function AssistantBubble({ children, time }: { children: ReactNode; time: string }) {
  return (
    <div className="self-start max-w-[85%] rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-[14px] text-evergreen shadow-sm">
      {children}
      <div className="mt-1 text-right text-[10px] text-border-active">{time}</div>
    </div>
  );
}

/** Conversa ilustrativa com o agente (Claude) no WhatsApp: áudio → foto → venda. */
export function WhatsAppChatPreview() {
  return (
    <div className="mx-auto w-full max-w-[380px] rounded-[36px] bg-evergreen p-2.5 shadow-[0_40px_80px_-30px_rgba(0,30,43,0.55)]">
      <div className="overflow-hidden rounded-[28px] bg-surface">
        <div className="flex items-center gap-3 bg-teal-dark px-4 py-3 text-white">
          <BrandMark size={34} />
          <div>
            <div className="text-[15px] font-semibold leading-tight">Colheita Direta</div>
            <div className="text-xs text-brand">assistente · online</div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 p-3.5 text-left">
          <ProducerBubble time="06:12">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-full bg-green-dark text-white">
                <AudioFilled />
              </span>
              <span
                className="flex h-6 items-center gap-[3px]"
                aria-label="Mensagem de áudio, 0:09"
              >
                {WAVEFORM_HEIGHTS.map((height, index) => (
                  <span
                    key={index}
                    className="w-[3px] rounded-full bg-green-dark/70"
                    style={{ height }}
                  />
                ))}
              </span>
              <span className="text-xs text-green-dark">0:09</span>
            </div>
            <div className="mt-1.5 text-xs italic text-border-active">
              “Colhi 30 caixas de tomate hoje, 20 quilos cada.”
            </div>
          </ProducerBubble>

          <AssistantBubble time="06:12">
            Anotado: 30 caixas de tomate, <WeightText kilograms={20} /> cada. Me manda uma foto da
            carga?
          </AssistantBubble>

          <ProducerBubble time="06:13">
            <div className="w-44">
              <TomatoCrateIllustration scanning={false} showLabels={false} />
            </div>
          </ProducerBubble>

          <AssistantBubble time="06:13">
            <span className="font-semibold">Classe A</span> ✅ Preço sugerido{' '}
            <MoneyText value={84} strong /> a caixa. Coloco à venda?
            <div className="mt-2 flex gap-2">
              <span className="rounded-full bg-green-dark px-3 py-1 text-xs font-semibold text-white">
                Vender
              </span>
              <span className="rounded-full border border-green-dark/30 px-3 py-1 text-xs font-semibold text-green-dark">
                Ver outras opções
              </span>
            </div>
          </AssistantBubble>

          <AssistantBubble time="09:40">
            Vendido! <MoneyText value={2520} strong /> chegaram no seu Pix. O frete busca amanhã às
            7h.
          </AssistantBubble>
        </div>
      </div>
    </div>
  );
}
