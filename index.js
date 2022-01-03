/* Este bloco está deixando os botões "nova transação" (main) e o "cancelar" (modal) ativos */
const modal = {
    open() {
        document.querySelector(".modal_overlay")
            .classList.add('active')
    },
    close() {
        document.querySelector(".modal_overlay")
            .classList.remove('active')
    }
};

/* Aqui armazenamos os dados num banco de dados local do navegador */
const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

/* Agora esta função está fazendo todas as contas necessárias para ser mostrada nos 3 cards principais na main */
const accounts = {
    all: Storage.get(),

    add(transaction) {
        accounts.all.push(transaction)

        App.reload()
    },

    remove(index) {
        accounts.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        let income = 0
        accounts.all.forEach(transactions => {
            if (transactions.amount > 0) {
                income += transactions.amount
            }
        })

        return income
    },
    expenses() {
        let expense = 0
        accounts.all.forEach(transactions => {
            if (transactions.amount < 0) {
                expense += transactions.amount
            }
        })

        return expense
    },
    total() {
        return accounts.incomes() + accounts.expenses();
    }
};

/* A responsabilidade deste outro bloco será de manipular os dados da view (html) */
const DOM = {
    transactionsContainer: document.querySelector('.main_table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img class="img" onclick="accounts.remove(${index})" src="./archives/minus.svg" alt="Remover Transação">
            </td>     
        `

        return html
    },

    updateCards() {
        document.querySelector(".income_display").innerHTML = Utils.formatCurrency(accounts.incomes())
        document.querySelector(".expense_display").innerHTML = Utils.formatCurrency(accounts.expenses())
        document.querySelector(".total_display").innerHTML = Utils.formatCurrency(accounts.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
};

/* Já este está formatando as "currency", os valores de R$ em toda página */
const Utils = {

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatAmount(value) {
        value = Number(value) * 100
        
        return value
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }
};

const Form = {
    description: document.querySelector("input#description"),
    amount: document.querySelector("input#amount"),
    date: document.querySelector("input#date"),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateField() {
        const { description, amount, date } = Form.getValues()


        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos!")
        }
    },

    formatValues() {
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return { description, amount, date }
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()

        try {
            Form.validateField()
            const transaction = Form.formatValues()
            accounts.add(transaction)
            Form.clearFields()
            modal.close()
        } catch (error) {
            alert(error.message)
        }
    }
};

/* Coloca o app para funcionar */
const App = {
    init() {
        accounts.all.forEach(DOM.addTransaction)

        DOM.updateCards()

        Storage.set(accounts.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    }
}

App.init()