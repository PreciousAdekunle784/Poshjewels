import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { updateOrderAction } from "@/app/admin/actions";
import { ActionForm, TextArea } from "@/components/admin/forms";
import { PageHeader, Panel, StatusPill } from "@/components/admin/ui";
import { orderTone, ORDER_LABEL } from "@/components/admin/order-status";
import { formatDateTime, formatNaira } from "@/lib/format";

export const metadata = { title: "Order" };

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const order = Number.isInteger(id) ? await db.query.orders.findFirst({ where: eq(schema.orders.id, id) }) : undefined;
  if (!order) notFound();
  const items = await db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, order.id));
  const waLink = `https://wa.me/${order.phone.replace(/[^\d]/g, "").replace(/^0/, "234")}`;

  return (
    <>
      <PageHeader
        title={`Order ${order.reference}`}
        description={
          <span className="flex flex-wrap items-center gap-3">
            <StatusPill tone={orderTone(order)}>{ORDER_LABEL(order)}</StatusPill> Placed {formatDateTime(order.createdAt)}
          </span>
        }
        actions={
          <Link href="/admin/orders" className="btn btn-outline">
            All orders
          </Link>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="grid gap-6">
          <Panel title="Items">
            <ul className="divide-y divide-line">
              {items.map((it) => (
                <li key={it.id} className="flex items-center gap-4 py-3">
                  <div className="relative h-16 w-13 shrink-0 overflow-hidden bg-bone">{it.imageUrl && <Image src={it.imageUrl} alt="" fill sizes="52px" className="object-cover" />}</div>
                  <div className="flex-1">
                    {it.productId ? (
                      <Link href={`/admin/products/${it.productId}`} className="underline-offset-4 hover:underline">
                        {it.productName}
                      </Link>
                    ) : (
                      it.productName
                    )}
                    <div className="text-[12.5px] text-stone">
                      {it.variantName ? `${it.variantName} · ` : ""}
                      {formatNaira(it.unitPrice)} × {it.quantity}
                    </div>
                  </div>
                  <span className="tabular">{formatNaira(it.unitPrice * it.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-3 grid gap-1 border-t border-line pt-3 text-[14px]">
              <div className="flex justify-between">
                <dt className="text-stone">Subtotal</dt>
                <dd className="tabular">{formatNaira(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone">Delivery ({order.state})</dt>
                <dd className="tabular">{formatNaira(order.shippingFee)}</dd>
              </div>
              <div className="flex justify-between text-[16px]">
                <dt>Total</dt>
                <dd className="tabular">{formatNaira(order.total)}</dd>
              </div>
            </dl>
          </Panel>

          <Panel title="Update order">
            <ActionForm action={updateOrderAction} submitLabel="Update order">
              <input type="hidden" name="id" value={order.id} />
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="field-label">Payment</span>
                  <select name="paymentStatus" defaultValue={order.paymentStatus} className="field">
                    <option value="unpaid">Awaiting payment</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </label>
                <label>
                  <span className="field-label">Fulfilment</span>
                  <select name="status" defaultValue={order.status} className="field" disabled={order.status === "cancelled"}>
                    <option value="pending">New</option>
                    <option value="processing">Preparing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled (returns stock)</option>
                  </select>
                  {order.status === "cancelled" && <input type="hidden" name="status" value="cancelled" />}
                </label>
              </div>
              <TextArea name="adminNote" label="Private note" defaultValue={order.adminNote ?? ""} rows={3} hint="Only visible in the dashboard." />
            </ActionForm>
            {order.paymentMethod === "paystack" && order.paymentReference && (
              <p className="mt-4 text-[12.5px] text-stone">
                Paystack reference: <span className="tabular">{order.paymentReference}</span>. Card payments are marked paid automatically after Paystack confirms them.
              </p>
            )}
          </Panel>
        </div>

        <div className="grid content-start gap-6">
          <Panel title="Customer">
            <p>
              {order.firstName} {order.lastName}
            </p>
            <p className="mt-1">
              <a href={`mailto:${order.email}`} className="underline underline-offset-4">
                {order.email}
              </a>
            </p>
            <p className="mt-1">
              <a href={`tel:${order.phone}`} className="underline underline-offset-4">
                {order.phone}
              </a>{" "}
              ·{" "}
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                WhatsApp
              </a>
            </p>
            {order.userId && <p className="mt-2 text-[12.5px] text-stone">Has a customer account</p>}
          </Panel>
          <Panel title="Delivery address">
            <p className="leading-relaxed">
              {order.address}
              <br />
              {order.city}, {order.state}
            </p>
            {order.note && (
              <p className="mt-3 border-t border-line pt-3 text-[13.5px]">
                <span className="text-stone">Customer note: </span>
                {order.note}
              </p>
            )}
          </Panel>
          <Panel title="Payment">
            <p>{order.paymentMethod === "paystack" ? "Paystack (card, bank, USSD)" : "Direct bank transfer"}</p>
            {order.paidAt && <p className="mt-1 text-[13px] text-stone">Paid {formatDateTime(order.paidAt)}</p>}
          </Panel>
        </div>
      </div>
    </>
  );
}
