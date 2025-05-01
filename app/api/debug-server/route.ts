import { createServerSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const results: any = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      connectionInfo: {
        supabaseUrl: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
      products: null,
      orders: null,
      testInsert: null,
      testDelete: null,
    }

    // Test 1: Try to fetch products
    try {
      const { data: products, error } = await supabase.from("products").select("id, name").limit(5)

      results.products = {
        success: !error,
        error: error ? error.message : null,
        count: products?.length || 0,
        data: products?.map((p) => ({ id: p.id, name: p.name })),
      }
    } catch (err: any) {
      results.products = {
        success: false,
        error: err.message,
        count: 0,
        data: null,
      }
    }

    // Test 2: Try to fetch orders
    try {
      const { data: orders, error } = await supabase.from("orders").select("id, customer_name, created_at").limit(5)

      results.orders = {
        success: !error,
        error: error ? error.message : null,
        count: orders?.length || 0,
        data: orders?.map((o) => ({
          id: o.id,
          customer_name: o.customer_name,
          created_at: o.created_at,
        })),
      }
    } catch (err: any) {
      results.orders = {
        success: false,
        error: err.message,
        count: 0,
        data: null,
      }
    }

    // Test 3: Try to insert a test product
    try {
      const testProduct = {
        name: `Server Test ${Date.now()}`,
        price: 1,
        quantity: 1,
        barcode: `SERVER-TEST-${Date.now()}`,
      }

      const { data: inserted, error } = await supabase.from("products").insert(testProduct).select()

      results.testInsert = {
        success: !error,
        error: error ? error.message : null,
        data: inserted ? inserted[0]?.id : null,
      }

      // Test 4: Delete the test product if it was inserted
      if (!error && inserted && inserted.length > 0) {
        const { error: deleteError } = await supabase.from("products").delete().eq("id", inserted[0].id)

        results.testDelete = {
          success: !deleteError,
          error: deleteError ? deleteError.message : null,
        }
      }
    } catch (err: any) {
      results.testInsert = {
        success: false,
        error: err.message,
        data: null,
      }
    }

    return NextResponse.json(results)
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
