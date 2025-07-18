import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { catchError, defer, from, map, Observable, switchMap, throwError } from "rxjs";
import { HttpCustomErrors } from "../../interface/exceptions/http.custom.error.erros";
import { TentantDto } from "../../application/dtos/tentant.dto";
import { TentantDocument, TenantEntity } from "../../domain/entities/tenant.entity";
import { TentantRepository } from "../../domain/repositories/tentant.repository";

@Injectable()
export class MongoTentantRepository implements TentantRepository {


    private readonly logger = new Logger(MongoTentantRepository.name);

    constructor(
        @InjectModel(TenantEntity.name) private readonly tentantModel: Model<TentantDocument>,
    ) { }

    saveTentant(tentant: TenantEntity): Observable<TentantDto> {
        return defer(async () => {
            try {
                const createdTentant = new this.tentantModel(tentant);
                await createdTentant.save();

                this.logger.log(`[INFO] Tentant created successfully: ${createdTentant.firstName}`);

                return createdTentant.toObject();
            } catch (error) {
                this.logger.error('[ERROR] Error creating tentant', error.stack);
                throw new HttpCustomErrors(`Error creating tentant: ${tentant}`, HttpStatus.BAD_REQUEST);
            }
        });
    }

    getTentantByCpf(cpf: string): Observable<TenantEntity | null> {
        return defer(() =>
            this.tentantModel.findOne({ cpf, isActive: true }).lean().exec()
        ).pipe(
            catchError(error => {
                this.logger.error('[ERROR] Error when trying to find tentant', error.stack);
                throw new HttpCustomErrors(`Error when trying to find tentant: ${cpf}`, HttpStatus.BAD_REQUEST);
            })
        );
    }

    deleteTentantByCpf(cpf: string): Observable<void> {
        return this.getTentantByCpf(cpf).pipe(
            switchMap(tentant => {
                if (!tentant) {
                    this.logger.log(`[INFO] Tentant not found for deletion: ${cpf}`);
                    return throwError(() => new HttpCustomErrors(`[ERROR] Tentant not found for deletion: ${cpf}`, HttpStatus.NOT_FOUND));
                }
                this.logger.log(`[INFO] Attempting to delete tentant with CPF: ${tentant.firstName}`);
                return from(this.tentantModel.updateOne({ cpf }, { $set: { isActive: false } }).exec()).pipe(
                    map(() => undefined)
                );
            }),
            catchError(error => {
                this.logger.error('[ERROR] Error when trying to delete tentant', error.stack);

                if (error instanceof HttpCustomErrors) {
                    return throwError(() => error);
                }
                return throwError(() => new HttpCustomErrors(
                    `Error when trying to delete tentant: ${cpf}`,
                    HttpStatus.BAD_REQUEST,
                ));
            })
        );
    }

    updateTentant(tentantEntity: TenantEntity): Observable<TentantDto> {
        return this.getTentantByCpf(tentantEntity.cpf).pipe(
            switchMap(existingTentant => {
                if (!existingTentant) {
                    this.logger.warn(`[WARN] Tentant not found for update: ${tentantEntity.cpf}`);
                    return throwError(() => new HttpCustomErrors(`Tentant not found for update: ${tentantEntity.cpf}`, HttpStatus.NOT_FOUND));
                }

                this.logger.log(`[INFO] Updating tentant: ${tentantEntity.cpf}`);

                return from(
                    this.tentantModel.findOneAndUpdate(
                        { cpf: tentantEntity.cpf },
                        { $set: { ...tentantEntity } },
                        { new: true }
                    ).lean().exec()
                ).pipe(
                    map(updatedTentant => {
                        if (!updatedTentant) {
                            throw new HttpCustomErrors(`Failed to update tentant: ${tentantEntity.cpf}`, HttpStatus.BAD_REQUEST);
                        }

                        return updatedTentant;
                    })
                );
            }),
            catchError(error => {
                this.logger.error('[ERROR] Error when trying to update tentant', error.stack);

                if (error instanceof HttpCustomErrors) {
                    return throwError(() => error);
                }

                return throwError(() =>
                    new HttpCustomErrors(`Unexpected error updating tentant: ${tentantEntity.cpf}`, HttpStatus.INTERNAL_SERVER_ERROR)
                );
            })
        );
    }

}