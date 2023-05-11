/**
 * @jest-environment jsdom
 */
// screen will query inside the html document
import { screen, waitFor } from "@testing-library/dom";
// getByTestId find by data-testid attribute
import { getByTestId } from "@testing-library/dom";
// a definir
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import Bills from "../containers/Bills.js";
import mockStore from "../__mocks__/store";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    // test 1 => nous verifions si l'icon bill est allumé
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      expect(windowIcon.className).toBe("active-icon");
    });
    // test 2 => nous vérifions si les dates sont ranger dans l'ordre ou non
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });
  // test 3 => nous verifions si le fichier bills.js fonctionne correctement (test rajouté)
  describe("When bill page send Error", () => {
    test("Then is should render an Error message to the user", () => {
      const html = BillsUI({ error: true });
      document.body.innerHTML = html;
      const errorMessage = getByTestId(document.body, "error-message");
      expect(errorMessage).toBeDefined();
    });
  });
  // test 4
  describe("when you click in your icon bills ", () => {
    test("modal should open", () => {
      document.body.innerHTML = BillsUI({ data: [bills[0]] });
      const onNavigate = (pathname) =>
        (document.body.innerHTML = ROUTES({ pathname }));
      const billsOne = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });
      $.fn.modal = jest.fn();
      const iconEye = screen.getByTestId("icon-eye");
      const handleClickIconEye = jest.fn(billsOne.handleClickIconEye(iconEye));
      // si je clique sur l'icon eye je rajoute un addeventListener
      iconEye.addEventListener("click", handleClickIconEye);
      userEvent.click(iconEye);
      expect(handleClickIconEye).toHaveBeenCalled();
    });
  });
});
// 404
describe("Given I am a user connected as Admin", () => {
  describe("When I navigate to bills", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Admin", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      expect(screen.getByTestId("btn-new-bill")).toBeTruthy();
    });
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Admin",
            email: "a@a",
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });
      // 404
      test("when bills return error 404", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });
      // 500
      test("when bills return error 500", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});

// avec l'error 404 et 500 j'ai cette erreur => TypeError: _store.default.bills.mockImplementationOnce is not a function
