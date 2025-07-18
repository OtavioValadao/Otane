import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { catchError, map, Observable, throwError } from "rxjs";
import { MongoTentantRepository } from "../../infra/repositories/mongo.tentant.repository";
import { TentantRabbitMqPublisher } from "../../infra/messaging/tentant.rabbitMq.publisher";
import { TentantDto } from "../dtos/tentant.dto";
import { toTentantDto, toTentantEntity } from "../mappers/tentant.mapper";
import { HttpCustomErrors } from "../../interface/exceptions/http.custom.error.erros";

@Injectable()
export class TentantUseCase {

    private readonly logger = new Logger(TentantUseCase.name)

    constructor(
        private readonly tentantRepository: MongoTentantRepository,
        private readonly tentantPublisher: TentantRabbitMqPublisher,
    ) { }

    createTentant(tentant: TentantDto): Observable<TentantDto> {
        this.logger.log('[INFO] Trying to create new tentant:', tentant);

        const tentantEntity = toTentantEntity(tentant);

        return this.tentantRepository.saveTentant(tentantEntity).pipe(
            map(createdTentant => {
                this.logger.log(`[INFO] Tentant created successfully: ${createdTentant.firstName}`);

                this.tentantPublisher.sendWeelcomeEmail(toTentantDto(createdTentant)).subscribe({
                    next: () => this.logger.log('Welcome email sent successfully'),
                    error: err => this.logger.error('Error sending welcome email', err),
                });

                return toTentantDto(createdTentant);
            }),
            catchError(error => {
                this.logger.error('[ERROR] Error in createTentant', error.stack || error.message);
                return throwError(() => error);
            })
        );
    }

    getTentant(cpf: string): Observable<TentantDto> {
        return this.tentantRepository.getTentantByCpf(cpf).pipe(
            map(tentant => {
                if (!tentant) {
                    throw new HttpCustomErrors(`[ERROR] Tentant not found: ${cpf}`, HttpStatus.NOT_FOUND);
                }
                return toTentantDto(tentant);
            })
        );
    }

    deleteTentant(cpf: string): Observable<void> {
        return this.tentantRepository.deleteTentantByCpf(cpf).pipe(
            map(() => this.logger.log(`[INFO] Tentant ${cpf} deleted (soft)`)),
            catchError(err => {
                this.logger.error('[ERROR] Failed to delete tentant:', err.stack);
                throw err;
            })
        );
    }

    updateTentant(tentantDto: TentantDto): Observable<TentantDto> {
        this.logger.log('[INFO] Trying to update tentant:', tentantDto);

        const tentantEntity = toTentantEntity(tentantDto);

        return this.tentantRepository.updateTentant(tentantEntity).pipe(
            map(updatedTentant => {
                this.logger.log(`[INFO] Tentant updated successfully: ${updatedTentant.firstName}`);
                return toTentantDto(updatedTentant);
            }),
            catchError(error => {
                this.logger.error('[ERROR] Error in updateTentant', error.stack || error.message);
                return throwError(() => new HttpCustomErrors('[ERROR] Failed to update tentant', HttpStatus.BAD_REQUEST));
            })
        );
    }
}
