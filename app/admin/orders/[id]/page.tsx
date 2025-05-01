import { createServerSupabaseClient } from "@/lib/supabase"
import { notFound } from "next/navigation"
import OrderDetailsClient from "./order-details-client"

interface PageProps {
  params: {
    id: string
  }
}

export default async function OrderDetailsPage({ params }: PageProps) {
  const supabase = createServerSupabaseClient()

  // جلب بيانات الطلب
  const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", params.id).single()

  if (orderError || !order) {
    notFound()
  }

  // جلب عناصر الطلب
  const { data: orderItems, error: itemsError } = await supabase
    .from("order_items")
    .select(`
      *,
      product:product_id (
        id,
        name,
        image_url,
        barcode
      )
    `)
    .eq("order_id", params.id)

  // حساب إجمالي الطلب
  const totalAmount = orderItems?.reduce((total, item) => total + item.price * item.quantity, 0) || 0

  return <OrderDetailsClient order={order} orderItems={orderItems || []} totalAmount={totalAmount} />
}
