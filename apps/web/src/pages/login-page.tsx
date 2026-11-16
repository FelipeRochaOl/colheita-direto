import { PageSection } from '@colheita/ui-web';
import { useNavigate, useSearchParams } from 'react-router';
import { PhoneLoginForm } from '../features/auth/components/phone-login-form';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  return (
    <PageSection title="Entrar">
      <p className="mb-6 text-border-active">Sem senha: você recebe um código no WhatsApp (ou SMS).</p>
      <PhoneLoginForm onLoggedIn={() => navigate(searchParams.get('voltar') ?? '/cadastro')} />
    </PageSection>
  );
}
