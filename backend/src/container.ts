import { createInjector } from 'typed-inject';
import AttendanceModel from './models/attendance.model.js';
import { AttendanceService } from './services/attendance.service.js';
import { AttendanceController } from './controllers/attendance.controller.js';
import { ImageProcessor } from './utils/imageProcessor.js';

export class Container {
    private static instance = createInjector();

    static getInstance() {
        return Container.instance;
    }

    static async initialize(): Promise<any> {
        const container = Container.getInstance()
            .provideValue('AttendanceModel', AttendanceModel)
            .provideClass('ImageProcessor', ImageProcessor)
            .provideClass('AttendanceService', AttendanceService)
            .provideClass('AttendanceController', AttendanceController);

        return container;
    }
}
