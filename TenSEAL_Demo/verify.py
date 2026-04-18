import tenseal as ts
import time

def main():
    print("=== Privacy-Preserving Financial Verification with TenSEAL ===")
    
    # 1. Client Setup: Generate Homomorphic Encryption Context
    print("\n[Client] Setting up encryption context (CKKS Scheme)...")
    # CKKS scheme allows operations on floating point numbers
    context = ts.context(
        ts.SCHEME_TYPE.CKKS,
        poly_modulus_degree=8192,
        coeff_mod_bit_sizes=[60, 40, 40, 60]
    )
    context.global_scale = 2**40
    # Generate public parameters for the server
    context.generate_galois_keys()

    # 2. Client Encrypts Data
    actual_balance = [5000.50]  # The user's actual financial balance
    print(f"[Client] Actual Balance: ${actual_balance[0]}")
    print("[Client] Encrypting balance...")
    start_time = time.time()
    encrypted_balance = ts.ckks_vector(context, actual_balance)
    print(f"[Client] Encryption took {time.time() - start_time:.4f}s")
    
    # Serialize data to simulate sending over network to Server
    serialized_context = context.serialize(save_public_key=True, save_secret_key=False, save_galois_keys=True, save_relin_keys=True)
    serialized_balance = encrypted_balance.serialize()
    
    print("\n--- Network Transfer (Client -> Server) ---")

    # 3. Server-side Computation
    print("\n[Server] Received encrypted balance and public context (No Private Key!).")
    # Server loads the context without the secret key
    server_context = ts.context_from(serialized_context)
    server_encrypted_balance = ts.lazy_ckks_vector_from(serialized_balance)
    server_encrypted_balance.link_context(server_context)

    # Threshold for validation (e.g. Loan qualification requires > $3000)
    threshold = [3000.00]
    print(f"[Server] Verifying if balance is >= ${threshold[0]} WITHOUT decrypting...")
    
    start_time = time.time()
    # The server computes the difference homomorphically
    # If (Balance - Threshold) >= 0, the threshold is met
    encrypted_result = server_encrypted_balance - threshold
    print(f"[Server] Homomorphic computation took {time.time() - start_time:.4f}s")
    
    # Serialize result to send back to client or verification layer
    serialized_result = encrypted_result.serialize()

    print("\n--- Network Transfer (Server -> Verifier/Client) ---")

    # 4. Client Decryption and Verification
    print("\n[Client] Received encrypted computational match from Server.")
    # Client loads the result into their context (which has the secret key)
    client_result = ts.lazy_ckks_vector_from(serialized_result)
    client_result.link_context(context)
    
    print("[Client] Decrypting result...")
    start_time = time.time()
    decrypted_diff = client_result.decrypt()[0]
    print(f"[Client] Decryption took {time.time() - start_time:.4f}s")
    
    print(f"\n=== Final Verdict ===")
    print(f"Decrypted Difference Homomorphically (Balance - Threshold): {decrypted_diff:.2f}")
    if decrypted_diff >= 0:
        print("Result: \u2705 APPROVED. Balance securely meets or exceeds the threshold.")
    else:
        print("Result: \u274C DENIED. Balance is below the threshold.")

if __name__ == "__main__":
    main()
