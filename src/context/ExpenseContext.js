import { createContext, useState, useContext, useEffect } from "react";
import { getDate, getCategoryColor, getId } from "../helper"

import AsyncStorage from "@react-native-async-storage/async-storage";



export const ExpenseContext = createContext();

export function ExpenseProvider({ children }) {
    const [expenses, setExpenses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    //Get data from local storage   
    useEffect(() => {
        const getData = async () => {
            try {
                const storeExpenses = await AsyncStorage.getItem("expenseslist");

                if (storeExpenses !== null)
                    setExpenses(JSON.parse(storeExpenses));
            } catch (error) {
                console.error("Failed to fetch expenses from storage", error);
            } finally {
                setIsLoading(false);
            }
        };
        getData();
    }, []);

    //Save data to local storage    
    useEffect(() => {
        if (!isLoading) {
            const saveExpenses = async () => {
                try {
                    await AsyncStorage.setItem("expenseslist", JSON.stringify(expenses))

                } catch (error) {
                    console.error("Failed to save expenses to storage", error);
                }
            }
            saveExpenses();
        }
        
    }, [expenses]);


    const addExpense = (expense) => {
        const newExpense = {
            id: getId(),
            title: expense.title,
            amount: Number(expense.amount),
            category: expense.category.name,
            date: getDate(),
            color: getCategoryColor(expense.category.color),
            icon: expense.category.icon,
        };

        setExpenses([...expenses, newExpense]);
    };

    const deleteExpense = (id) => {
    setExpenses((prevExpenses) =>
        prevExpenses.filter((item) => item.id !== id)
    );
};


   return (
    <ExpenseContext.Provider value={{ expenses, addExpense, deleteExpense }}>
        {children}
    </ExpenseContext.Provider>
);
}

export const useExpenses = () => useContext(ExpenseContext);