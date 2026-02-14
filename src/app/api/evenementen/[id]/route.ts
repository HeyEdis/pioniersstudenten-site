import * as eventService from "@/service/events";

export async function GET( request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await eventService.getById(parseInt(id));

  if (!event){
    return Response.json(
        {error: "Evenement niet gevonden."},
        {status: 404}
    );
  }
  
  return Response.json(event);
}

export async function POST(request: Request) {
  const incomingData = await request.json()
  const user = incomingData.get("user");
  const newEvent = eventService.create(user,incomingData);
  
  return Response.json({ newEvent })
}


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
