import { CheckOutlined, LockOutlined } from '@ant-design/icons';
import { gradients } from '@colheita/design-tokens';
import { BrandMark } from '@colheita/ui-web';
import { useNavigate, useSearchParams } from 'react-router';
import { PhoneLoginForm } from '../features/auth/components/phone-login-form';
import { landingPathFor } from '../utils/role-home';

const LOGIN_BENEFITS = [
  'Venda direto, sem atravessador',
  'Pix na hora, com o frete já dividido',
  'Tudo também pelo WhatsApp',
];

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  return (
    <section className="mx-auto max-w-[1416px] px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[32px] bg-white ring-1 ring-black/5 shadow-[0_32px_64px_-32px_rgba(0,30,43,0.35)] md:grid-cols-2">
        <div
          className="relative hidden flex-col justify-between bg-evergreen p-10 text-white md:flex"
          style={{ backgroundImage: gradients.heroGlow }}
        >
          <BrandMark size={44} />
          <div>
            <h2 className="font-serif text-4xl font-light leading-[1.08] tracking-[-0.02em]">
              Bom te ver de novo na <em className="text-brand">Colheita Direta</em>
            </h2>
            <ul className="mt-8 space-y-3 text-muted">
              {LOGIN_BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3">
                  <CheckOutlined className="text-brand!" /> {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="p-8 sm:p-12">
          <div className="font-mono text-xs uppercase tracking-[0.16em] text-green-dark">
            Acesso
          </div>
          <h1 className="mt-3 font-serif text-4xl font-normal tracking-[-0.015em] text-evergreen">
            Entrar
          </h1>
          <p className="mt-3 mb-8 inline-flex items-center gap-2 text-border-active">
            <LockOutlined /> Sem senha: você recebe um código no WhatsApp (ou SMS).
          </p>
          <PhoneLoginForm
            onLoggedIn={(session) =>
              navigate(landingPathFor(session.user.roles, searchParams.get('voltar')))
            }
          />
        </div>
      </div>
    </section>
  );
}
