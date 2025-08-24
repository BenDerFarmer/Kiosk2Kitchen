/* @refresh reload */
import { render } from "solid-js/web";
import "./index.css";
import { createSignal, For, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { PRODUCTS, type Order, type Product, type WsMessage } from "./products";
import { Orders } from "./orders";
import { A, HashRouter, Route } from "@solidjs/router";

const root = document.getElementById("root");

function App() {
  const [cart, setCart] = createStore<Record<string, number | undefined>>({});
  const [ws, _] = createSignal(
    new WebSocket(
      location.protocol === "https:"
        ? "wss:"
        : "ws:" + "//" + location.host + "/ws",
    ),
  );

  const changeCart = (prod: Product, delta: number) => {
    const id = prod.id;
    const cur = cart[id] ?? 0;
    const next = cur + delta;

    if (next > 0) {
      setCart(id, next);
    } else {
      setCart(id, undefined);
    }
  };
  const total = () =>
    Object.entries(cart).reduce((sum, [id, q]) => {
      const p = PRODUCTS.find((x) => x.id === id);
      return sum + (p ? p.price * (q || 0) : 0);
    }, 0);

  return (
    <div class="min-h-screen bg-base-200 p-6">
      <main class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        <section class="md:col-span-3">
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <For each={PRODUCTS}>
              {(p) => (
                <article class="card cursor-pointer bg-base-100 shadow hover:shadow-lg transition">
                  <figure class="h-32 bg-gradient-to-br from-base-200 to-base-300 flex items-center justify-center">
                    <div class="text-xs">{p.name}</div>
                  </figure>
                  <div class="card-body p-3">
                    <h3 class="card-title text-sm">{p.name}</h3>
                    <div class="card-actions justify-between items-center mt-2">
                      <div class="text-sm font-semibold">
                        €{p.price.toFixed(2)}
                      </div>
                      <div class="flex items-center gap-2">
                        <button
                          class="btn btn-sm btn-outline w-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            changeCart(p, -1);
                          }}
                        >
                          -
                        </button>
                        <button
                          class="btn btn-sm btn-outline w-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            changeCart(p, 1);
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              )}
            </For>
          </div>
        </section>

        <aside class="md:col-span-1 h-10/12">
          <div class="card bg-base-100 shadow h-full flex justify-between">
            <div class="p-3">
              <h5 class="font-bold mb-2">Bestellung</h5>
              <ul class="menu menu-compact">
                <Show
                  when={Object.keys(cart).length > 0}
                  fallback={
                    <li class="text-sm text-muted">
                      Füge ein Produkt hinzu ...
                    </li>
                  }
                >
                  <For each={Object.entries(cart)}>
                    {([id, q]) => {
                      const p = PRODUCTS.find((x) => x.id === id)!;
                      return (
                        <li class="flex items-center justify-between">
                          <div>
                            <div class="font-medium text-sm">{p.name}</div>
                            <div class="text-xs text-muted">
                              {q} × €{p.price.toFixed(2)}
                            </div>
                          </div>
                          <div class="flex items-center gap-2">
                            <div class="font-semibold">
                              €{p.price * (q || 0)}
                            </div>
                            <button
                              class="btn btn-ghost btn-sm"
                              onClick={() => changeCart(p, -(cart[p.id] || 0))}
                            >
                              ✕
                            </button>
                          </div>
                        </li>
                      );
                    }}
                  </For>
                </Show>
              </ul>
              <div class="mt-3 border-t pt-3 flex items-center justify-between">
                <div class="font-semibold">Gesamt</div>
                <div class="text-lg font-bold">€{total().toFixed(2)}</div>
              </div>
            </div>
            <div class="bg-base-200 p-3 flex justify-between justify-self-end">
              <A class="btn btn-secondary" href="orders">
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
                >
                  <path d="M3 12h.01" />
                  <path d="M3 18h.01" />
                  <path d="M3 6h.01" />
                  <path d="M8 12h13" />
                  <path d="M8 18h13" />
                  <path d="M8 6h13" />
                </svg>
              </A>
              <button
                class="btn btn-success"
                onclick={() => {
                  const order: Order = {
                    orderTime: Date.now(),
                    products: { ...cart } as Record<string, number>,
                    id: self.crypto.randomUUID(),
                  };

                  Object.entries(cart).forEach(([id, _]) => {
                    setCart(id, undefined);
                  });

                  const msg: WsMessage = {
                    type: "Add",
                    data: order,
                  };

                  ws().send(JSON.stringify(msg));
                }}
              >
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
                >
                  <path d="M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z" />
                  <path d="M6 12h16" />
                </svg>
              </button>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

render(
  () => (
    <HashRouter>
      <Route path="/" component={App} />
      <Route path="/orders" component={Orders} />
    </HashRouter>
  ),
  root!,
);
