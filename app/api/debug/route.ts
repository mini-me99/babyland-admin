import { createServerSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Test products table
    const {
      data: products,
      error: productsError,
      count: productsCount,
    } = await supabase.from("products").select("*", { count: "exact" }).limit(1)

    // Test orders table
    const {
      data: orders,
      error: ordersError,
      count: ordersCount,
    } = await supabase.from("orders").select("*", { count: "exact" }).limit(1)

    return NextResponse.json({
      success: true,
      environment: process.env.NODE_ENV,
      supabaseUrl: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      products: {
        success: !productsError,
        count: productsCount,
        error: productsError ? productsError.message : null,
        sample: products && products.length > 0 ? { id: products[0].id } : null,
      },
      orders: {
        success: !ordersError,
        count: ordersCount,
        error: ordersError ? ordersError.message : null,
        sample: orders && orders.length > 0 ? { id: orders[0].id } : null,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
