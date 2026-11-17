import { saveSettingsAction } from "@/app/admin/actions";
import { ActionForm, Check, Field, TextArea } from "@/components/admin/forms";
import { PageHeader, Panel } from "@/components/admin/ui";
import { paystackEnabled } from "@/lib/paystack";
import { getSettings } from "@/lib/settings";
import { SITE_URL } from "@/lib/site";

export const metadata = { title: "Store settings" };

export default async function SettingsPage() {
  const s = await getSettings(["announcement", "contact", "shipping", "bank"]);
  return (
    <>
      <PageHeader title="Store settings" />
      <div className="grid gap-6">
        <Panel title="Announcement bar">
          <ActionForm action={saveSettingsAction}>
            <input type="hidden" name="_key" value="announcement" />
            <Check name="enabled" label="Show the announcement bar" defaultChecked={s.announcement.enabled} />
            <Field name="text" label="Message" defaultValue={s.announcement.text} maxLength={120} hint="Keep it short: one line on a phone is about 45 characters." />
            <Field name="link" label="Link (optional)" defaultValue={s.announcement.link} placeholder="/collections/new-arrivals" />
          </ActionForm>
        </Panel>

        <div id="contact">
          <Panel title="Contact details">
            <ActionForm action={saveSettingsAction}>
              <input type="hidden" name="_key" value="contact" />
              <p className="text-[13px] text-stone">Shown in the footer and on the Contact page. Leave a field empty to hide it.</p>
              <div className="grid gap-4 md:grid-cols-2">
                <Field name="email" label="Email" type="email" defaultValue={s.contact.email} />
                <Field name="phone" label="Phone" defaultValue={s.contact.phone} />
                <Field name="whatsapp" label="WhatsApp number" defaultValue={s.contact.whatsapp} placeholder="2348012345678" />
                <Field name="hours" label="Opening hours" defaultValue={s.contact.hours} placeholder="Mon–Sat, 9am–6pm" />
                <Field name="instagram" label="Instagram handle" defaultValue={s.contact.instagram} placeholder="@poshjewel" />
                <Field name="tiktok" label="TikTok handle" defaultValue={s.contact.tiktok} />
              </div>
              <TextArea name="address" label="Address" defaultValue={s.contact.address} rows={2} />
            </ActionForm>
          </Panel>
        </div>

        <Panel title="Delivery fees">
          <ActionForm action={saveSettingsAction}>
            <input type="hidden" name="_key" value="shipping" />
            <div className="grid gap-4 md:grid-cols-3">
              <Field name="lagosFee" label="Lagos (₦)" inputMode="numeric" defaultValue={s.shipping.lagosFee} />
              <Field name="otherStatesFee" label="Other states (₦)" inputMode="numeric" defaultValue={s.shipping.otherStatesFee} />
              <Field name="freeShippingThreshold" label="Free delivery from (₦)" inputMode="numeric" defaultValue={s.shipping.freeShippingThreshold} hint="0 turns free delivery off." />
            </div>
            <TextArea name="deliveryNote" label="Delivery times (shown on product pages)" defaultValue={s.shipping.deliveryNote} rows={3} />
          </ActionForm>
        </Panel>

        <div id="bank">
          <Panel title="Payments">
            <div className="mb-6 border-b border-line pb-6">
              <p className="label text-[10.5px] text-stone">Paystack</p>
              {paystackEnabled() ? (
                <p className="mt-2">Connected. Card, bank and USSD payments are offered at checkout.</p>
              ) : (
                <p className="mt-2 max-w-[70ch] text-stone">
                  Not connected. To accept cards, add your Paystack secret key as <code className="bg-bone px-1">PAYSTACK_SECRET_KEY</code> in the server environment, and set the webhook URL in your Paystack dashboard to{" "}
                  <code className="bg-bone px-1">{SITE_URL}/api/paystack/webhook</code>. Secret keys are never stored in the database.
                </p>
              )}
            </div>
            <ActionForm action={saveSettingsAction}>
              <input type="hidden" name="_key" value="bank" />
              <Check name="enabled" label="Offer direct bank transfer at checkout" defaultChecked={s.bank.enabled} />
              <div className="grid gap-4 md:grid-cols-3">
                <Field name="bankName" label="Bank" defaultValue={s.bank.bankName} />
                <Field name="accountName" label="Account name" defaultValue={s.bank.accountName} />
                <Field name="accountNumber" label="Account number" inputMode="numeric" maxLength={10} defaultValue={s.bank.accountNumber} />
              </div>
              <TextArea name="instructions" label="Instructions shown after ordering" defaultValue={s.bank.instructions} rows={3} />
            </ActionForm>
          </Panel>
        </div>
      </div>
    </>
  );
}
