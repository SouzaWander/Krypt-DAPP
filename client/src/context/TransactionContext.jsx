
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext();

const { ethereum } = window;

const getEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    console.log("hey")
    const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);

   console.log({
    provider,
    signer,
    transactionsContract
   })
   return transactionsContract;
}

export const TransactionProvider = ({children}) => {

    const [currentAccount, setCurrentAccount] = useState('');
    const [formData, setFormData] = useState({ addressTo: '', amount: '', keyword: '', message: ''});
    const[isLoading, setIsLoading] = useState(false)
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'));
    const [transactions, setTransactions] = useState([]);


    const handleChange = (e, name) => {
        setFormData((prevState) => ({ ...prevState, [name]: e.target.value}));
    }

    const getAllTransaction = async () => {
        try {
            if(!ethereum) return alert("Please install metamask");
            const transactionsContract = getEthereumContract();
            const availableTransactions = await transactionsContract.getAllTransactions();

            const structuredTransactions = availableTransactions.map((transaction) => ({
                addressTo: transaction.receiver,
                addressFrom: transaction.sender,
                timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(), 
                message: transaction.message,
                keyword: transaction.keyword,
                amount: parseInt(transaction.amount._hex) / (10**18)
            }))
            setTransactions(structuredTransactions);
            console.log(structuredTransactions)
        } catch (error) {
            console.log(error);
        }
    }

    const checkIfWalletIsConnected = async () => {

        try {
            if(!ethereum) return alert("Please install metamask");

        const accounts = await ethereum.request({ method: 'eth_accounts'});
        if(accounts.length){
            setCurrentAccount(accounts[0])
            getAllTransaction();
        } else {
            console.log('No accounts found');
        }
        } catch (error) {
            console.log(error)
            throw new Error("No ethereum object.");
        }
        
    }

    const connectWallet = async () => {
        try {
           if(!ethereum) return alert("Please install metamask");
           const accounts = await ethereum.request({ method: 'eth_requestAccounts'});
           setCurrentAccount(accounts[0])
        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object.");
        }
    }

    const checkIfTransactionsExist = async () => {
        try {
            const transactionsContract = getEthereumContract();
            const transactionCount = await transactionsContract.getTransactionCount();

            window.localStorage.setItem("transactionCount", transactionCount)
        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object.");
        }
    }

    const sendTransaction = async () => {

        try {
            if(!ethereum) return alert("Please install metamask");

            //get the data from the form
            const { addressTo, amount, keyword, message } = formData;
            const transactionsContract = getEthereumContract();
            const parsedAmount = ethers.utils.parseEther(amount);
            
            await ethereum.request({ 
                method: 'eth_sendTransaction',
                params: [{
                    from: currentAccount,
                    to: addressTo,
                    gas: '0x5208',// 21000 GWEI
                    value:parsedAmount._hex,
                }]
             })
             //store transaction in the contract
             const trasactioHash = await transactionsContract.addToBlockchain(addressTo, parsedAmount, message, keyword);
             setIsLoading(true);
             console.log(`Loading- ${trasactioHash.hash}`);
             await trasactioHash.wait();
             setIsLoading(false);
             console.log(`Success- ${trasactioHash.hash}`);

             const transactionCount = await transactionsContract.getTransactionCount();
             setTransactionCount(transactionCount.toNumber());
        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object.");
        }
    } 
    // it only happens when we load the application
    useEffect(() => {
        checkIfWalletIsConnected();
        checkIfTransactionsExist();
    }, [])

    return (
        <TransactionContext.Provider value={{ connectWallet, currentAccount, formData, setFormData, handleChange, sendTransaction, transactions}}>
            {children}
        </TransactionContext.Provider>
    )
}