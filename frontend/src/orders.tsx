import { For } from "solid-js/web";
import "./index.css";
import { type Order, PRODUCTS, type WsMessage } from "./products";
import { createSignal, onMount } from "solid-js";

export function Orders() {
  const [ws, _setWs] = createSignal(
    new WebSocket(
      location.protocol === "https:"
        ? "wss:"
        : "ws:" + "//" + location.host + "/ws",
    ),
  );

  const [now, setNow] = createSignal(Date.now());
  const [orders, setOrders] = createSignal<Order[]>([]);

  onMount(() => {
    setInterval(() => setNow(Date.now()), 10000);

    ws()!.onopen = () => {
      const newMsg: WsMessage = {
        type: "Request",
        data: {},
      };

      ws().send(JSON.stringify(newMsg));
    };

    ws()!.onmessage = (event) => {
      const msg: WsMessage = JSON.parse(event.data);

      switch (msg.type) {
        case "Add":
          setOrders((prev) => {
            const order = msg.data as Order;
            return [...prev, order];
          });
          break;
        case "Remove":
          setOrders((prev) => {
            const uuid = msg.data;
            return prev.filter((item, _) => item.id != uuid);
          });
          break;
        case "Request":
          const newMsg: WsMessage = {
            type: "All",
            data: orders(),
          };

          ws().send(JSON.stringify(newMsg));
          break;
        case "All":
          setOrders(msg.data as Order[]);
          break;
      }
    };
  });

  return (
    <ul class="list bg-base-200 rounded-box shadow-md m-5 gap-3 text-xl">
      <For each={orders()}>
        {(order) => (
          <li class="list-row">
            <ul>
              <For each={Object.entries(order.products)}>
                {([id, q]) => {
                  const p = PRODUCTS.find((x) => x.id === id)!;
                  return (
                    <li>
                      {q} x {p.name}
                    </li>
                  );
                }}
              </For>
            </ul>

            <div class="badge badge-accent">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-clock-icon lucide-clock"
              >
                <path d="M12 6v6l4 2" />
                <circle cx="12" cy="12" r="10" />
              </svg>
              {minutesSince(new Date(order.orderTime), now())} min
            </div>
            <button
              class="btn btn-success"
              onClick={() => {
                const msg: WsMessage = {
                  type: "Remove",
                  data: order.id,
                };
                ws().send(JSON.stringify(msg));
                setOrders((prev) =>
                  prev.filter((item, _) => item.id != order.id),
                );
              }}
            >
              X
            </button>
          </li>
        )}
      </For>
    </ul>
  );
}

const minutesSince = (pastDate: Date, now: number) => {
  const ms = now - pastDate.getTime();
  const min = Math.floor(ms / 60000);
  return min < 0 ? 0 : min;
};
