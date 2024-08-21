import { Response } from "express";

const RequestResponseMappings = {
    sendSuccessResponse: (
        res: Response,
        data: any = {},
        message: string = "Action Performed Successfully",
        status: number = 200
    ) => {
        return res.status(status).json({
            isSuccessful: true,
            status,
            message,
            timestamp: new Date().toISOString(),
            data
        });
    },

    sendErrorResponse: (
        res: Response,
        errors: any = [],
        message: string = "Action could not be performed",
        status: number = 500
    ) => {
        return res.status(status).json({
            isSuccessful: false,
            status,
            message,
            timestamp: new Date().toISOString(),
            errors: Array.isArray(errors) ? errors : [errors]
        });
    }
}

export default RequestResponseMappings;
