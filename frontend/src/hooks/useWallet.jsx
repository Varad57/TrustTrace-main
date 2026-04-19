import { createContext, useContext, useState, useCallback } from 'react'
import { connectWallet as connectWalletService, isWalletAvailable, checkNetwork } from '../services/blockchain'

const WalletContext = createContext(null)

export function WalletProvider({ children }) {
  const [wallet, setWallet] = useState({
    address: null,
    signer: null,
    provider: null,
    source: null, // 'metamask' | 'hardhat'
    status: 'disconnected', // disconnected | connecting | connected | error
    error: null,
    isCorrectNetwork: true,
  })

  const connect = useCallback(async () => {
    setWallet(prev => ({ ...prev, status: 'connecting', error: null }))

    try {
      const { address, provider, signer, source } = await connectWalletService()
      const isCorrectNetwork = await checkNetwork(provider)

      setWallet({
        address,
        signer,
        provider,
        source,
        status: 'connected',
        error: null,
        isCorrectNetwork,
      })

      return { address, signer, provider }
    } catch (err) {
      let errorMsg = 'Connection failed'

      if (err.code === 4001) {
        errorMsg = 'Connection rejected by user'
      } else if (err.message?.includes('user rejected')) {
        errorMsg = 'Connection rejected by user'
      } else if (!isWalletAvailable()) {
        errorMsg = 'No wallet detected — using Hardhat default account'
        // Try fallback connection
        try {
          const { address, provider, signer, source } = await connectWalletService()
          setWallet({
            address, signer, provider, source,
            status: 'connected',
            error: null,
            isCorrectNetwork: true,
          })
          return { address, signer, provider }
        } catch {
          errorMsg = 'Could not connect to local network'
        }
      }

      setWallet(prev => ({ ...prev, status: 'error', error: errorMsg }))
      throw new Error(errorMsg)
    }
  }, [])

  const disconnect = useCallback(() => {
    setWallet({
      address: null,
      signer: null,
      provider: null,
      source: null,
      status: 'disconnected',
      error: null,
      isCorrectNetwork: true,
    })
  }, [])

  const shortAddress = wallet.address
    ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
    : null

  return (
    <WalletContext.Provider value={{ ...wallet, shortAddress, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within WalletProvider')
  return ctx
}
