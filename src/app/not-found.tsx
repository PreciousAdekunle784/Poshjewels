import StoreLayout from "./(store)/layout";
import StoreNotFound from "./(store)/not-found";

/** URLs that match no route still get the full storefront chrome. */
export default function NotFound() {
  return (
    <StoreLayout>
      <StoreNotFound />
    </StoreLayout>
  );
}
