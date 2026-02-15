import * as eventService from "@/service/events";
import { EventUpdateSchema, EventSelectSchema } from "@/drizzle/zod";
import { EventByIdQuerySchema } from "../../schemas/events";
import ServiceError from "@/core/serviceError";

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
                {message: error.message},
                {status: error.status}
            );
        }
        return Response.json(
            { message: "Interne serverfout." }, 
            { status: 500 }
        );
    }
};

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await request.json();

    const validate = EventUpdateSchema.parse(body);
    const event = await eventService.updateById(parseInt(id), validate);
    console.log('id:' + JSON.stringify(id));
    console.log("body: "+ JSON.stringify(body));

    return Response.json(event);
};
 
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const event = await eventService.deleteById(parseInt(id));

    return Response.json({id: event});
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
