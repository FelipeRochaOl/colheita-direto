import { Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { confirmDonationReceiptSchema, registerNgoSchema } from '@colheita/contracts';
import type { AuthSession, ConfirmDonationReceiptInput, RegisterNgoInput } from '@colheita/contracts';
import { CurrentUser, Roles } from '../../../shared/auth/auth.decorators';
import { AuthenticatedUser } from '../../../shared/auth/authenticated-user';
import { ApiBodyFromSchema, ValidatedBody } from '../../../shared/validation/validated-body.decorator';
import { DonationProps } from '../entities/donation.entity';
import { AcceptDonationUseCase } from '../use-cases/accept-donation.use-case';
import { ApproveNgoUseCase } from '../use-cases/approve-ngo.use-case';
import { ConfirmDonationReceiptUseCase } from '../use-cases/confirm-donation-receipt.use-case';
import { ListAvailableDonationsUseCase } from '../use-cases/list-available-donations.use-case';
import { RegisterNgoUseCase } from '../use-cases/register-ngo.use-case';

@ApiTags('Doações')
@ApiBearerAuth()
@Controller()
export class NgosController {
  constructor(
    private readonly registerNgoUseCase: RegisterNgoUseCase,
    private readonly approveNgoUseCase: ApproveNgoUseCase,
    private readonly listAvailableDonationsUseCase: ListAvailableDonationsUseCase,
    private readonly acceptDonationUseCase: AcceptDonationUseCase,
    private readonly confirmDonationReceiptUseCase: ConfirmDonationReceiptUseCase,
  ) {}

  @Post('ngos')
  @ApiBodyFromSchema(registerNgoSchema)
  register(
    @CurrentUser() user: AuthenticatedUser,
    @ValidatedBody(registerNgoSchema) input: RegisterNgoInput,
  ): Promise<AuthSession> {
    return this.registerNgoUseCase.execute(user, input);
  }

  @Post('ngos/:ngoId/approval')
  @HttpCode(204)
  @Roles('admin')
  approve(@Param('ngoId') ngoId: string): Promise<void> {
    return this.approveNgoUseCase.execute(ngoId);
  }

  @Get('donations')
  @Roles('ngo')
  list(@CurrentUser() user: AuthenticatedUser): Promise<{ available: DonationProps[]; accepted: DonationProps[] }> {
    return this.listAvailableDonationsUseCase.execute(user.userId);
  }

  @Post('donations/:donationId/acceptance')
  @HttpCode(204)
  @Roles('ngo')
  accept(@CurrentUser() user: AuthenticatedUser, @Param('donationId') donationId: string): Promise<void> {
    return this.acceptDonationUseCase.execute(user.userId, donationId);
  }

  @Post('donations/:donationId/receipt')
  @HttpCode(204)
  @Roles('ngo')
  @ApiBodyFromSchema(confirmDonationReceiptSchema)
  confirmReceipt(
    @CurrentUser() user: AuthenticatedUser,
    @Param('donationId') donationId: string,
    @ValidatedBody(confirmDonationReceiptSchema) input: ConfirmDonationReceiptInput,
  ): Promise<void> {
    return this.confirmDonationReceiptUseCase.execute(user.userId, donationId, input);
  }
}
