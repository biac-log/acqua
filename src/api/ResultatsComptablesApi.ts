import api from './AxiosApi';
import { ResultatsComptablesDTO } from '@/models/ResultatComptable/ResultatComptable'

export abstract class ResultatsComptablesApi{
    static async getStructureFolderNames() : Promise<string[]>{
        const response = await api.AcQuaCore.get<string[]>('ResultatsComptables');
        return response.data;
    }

    static async getResultatsComptablesData(resultatsComptableDTO : ResultatsComptablesDTO) : Promise<any>{
        const response = await api.AcQuaCore.post<ResultatsComptablesDTO>('ResultatsComptables',resultatsComptableDTO);
        return response.data;
    }
}