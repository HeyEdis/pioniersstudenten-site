import * as eventService from "@/service/events";
import { EventUpdateSchema, EventSelectSchema } from "@/drizzle/zod";
import { EventByIdQuerySchema } from "../../schemas/events";
import ServiceError from "@/core/serviceError";
import { ZodError } from "zod";

export async function GET( request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        // Using validation scheme to coerce id to a number.
        const result = EventByIdQuerySchema.parse({id});
        const event = await eventService.getById(result.id);
        const validatedEvent = EventSelectSchema.parse(event);
    
        return Response.json(validatedEvent);
    } catch (error) {
        if (error instanceof ServiceError) {
            return Response.json(
                { message: error.message },
                { status: error.status }
            );
        }
        if (error instanceof ZodError){
            return Response.json(
                { message: error.issues.map(i => i.message) }, 
                { status: 400 }
            );
        }
        return Response.json(
            { message: "Er is een onverwachte fout opgetreden." },
            { status: 500 }
        );
    }
};

// GET.validationScheme = {
//   params: {
//     id: z.number().positive(),
//   },
// };

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const result = EventByIdQuerySchema.parse({id});
        const validatedEvent = EventUpdateSchema.parse(body);
    
        const event = await eventService.updateById(result.id, validatedEvent);
    
        return Response.json(event); 
    } catch (error) {
        // Checking if the error is a ServiceError to show the right errormessage
        if (error instanceof ServiceError) {
            return Response.json(
                { message: error.message },
                { status: error.status }
            );
        }
        // Checking if the error is a ZodError to show what the problem is
        if (error instanceof ZodError){
            return Response.json(
                { message: error.issues.map(i => i.message) }, 
                { status: 400 }
            );
        }
        // Everthing else gets handled like this.
        return Response.json(
            { message: "Er is een onverwachte fout opgetreden." },
            { status: 500 }
        );
    }
};
 
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    
    try {
        const { id } = await params;
        const result = EventByIdQuerySchema.parse({id});
    
        const event = await eventService.deleteById(result.id);
    
        return Response.json({id: event});
        
    } catch (error) {
        // Checking if the error is a ServiceError to show the right errormessage
        if (error instanceof ServiceError) {
            return Response.json(
                { message: error.message },
                { status: error.status }
            );
        }
        // Checking if the error is a ZodError to show what the problem is
        if (error instanceof ZodError){
            return Response.json(
                { message: error.issues.map(i => i.message) }, 
                { status: 400 }
            );
        }
        // Everthing else gets handled like this.
        return Response.json(
            { message: "Er is een onverwachte fout opgetreden." },
            { status: 500 }
        );
    }
};


// // Handler with parameters
// async function getProduct(
//   req: Request,
//   { params }: { params: { id: string } }
// ): Promise<Response> {
//   const product = await productRepository.findById(params.id);
  
//   if (!product) {
//     return Response.json(
//       { error: "Product not found" },
//       { status: 404 }
//     );
//   }
  
//   return Response.json(product);
// }

// // Handler with query parameters
// async function searchProducts(req: Request): Promise<Response> {
//   const url = new URL(req.url);
//   const query = url.searchParams.get("q");
//   const category = url.searchParams.get("category");
  
//   const products = await productRepository.search({
//     query,
//     category,
//   });
  
//   return Response.json(products);
// }
