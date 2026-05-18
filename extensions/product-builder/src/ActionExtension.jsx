import "@shopify/ui-extensions/preact";
import {render} from "preact";
import {useEffect} from "preact/hooks";

const APP_HANDLE = "product-builder-55";

export default async () => {
  render(<Extension />, document.body);
};

function Extension() {
  const {data, navigation, close} = shopify;

  useEffect(() => {
    const gid = data.selected[0].id;

    const productId = gid.split("/").pop();

    navigation.navigate(
      `shopify://admin/apps/${APP_HANDLE}/app/${productId}`
    );

    close();
  }, []);

  return (
    <s-admin-action title="Redirecting...">
      <s-loading />
    </s-admin-action>
  );
}