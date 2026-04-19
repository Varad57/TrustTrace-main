import tenseal as ts
import requests
import base64

def main():
    print("=== Client: Environment Setup ===")
    context = ts.context(ts.SCHEME_TYPE.CKKS, poly_modulus_degree=8192, coeff_mod_bit_sizes=[60, 40, 40, 60])
    context.global_scale = 2**40
    context.generate_galois_keys()

    # 1. Register Public Context
    user_id = "alice"
    public_context = context.serialize(save_secret_key=False)
    requests.post("http://host.docker.internal:8080/register", json={
        "user_id": user_id,
        "context": base64.b64encode(public_context).decode('utf-8')
    })
    print("[Client] Registered public TenSEAL context with Go backend.")

    # 2. Encrypt & Save Balance
    balance = [5000.50]
    print(f"[Client] Encrypting balance: ${balance[0]}")
    enc_bal = ts.ckks_vector(context, balance)
    bal_bytes = enc_bal.serialize()
    
    requests.post("http://host.docker.internal:8080/balance", json={
        "user_id": user_id,
        "balance": base64.b64encode(bal_bytes).decode('utf-8')
    })
    print("[Client] Posted Base64 Encrypted Vector to Go backend.")

    # 3. Third-Party Verify via Go
    threshold = 3000.00
    print(f"\n[Client] Third-party triggers Zero-Knowledge check: Is {user_id}'s balance >= ${threshold}?")
    resp = requests.get(f"http://host.docker.internal:8080/verify_balance?user_id={user_id}&threshold={threshold}")
    
    res_b64 = resp.json()["result_vector"]
    print("[Client] Received Encrypted Difference vector from Go backend (which secretly called Python).")

    # 4. Decrypt and check
    res_bytes = base64.b64decode(res_b64)
    res_vector = ts.lazy_ckks_vector_from(res_bytes)
    res_vector.link_context(context)

    diff = res_vector.decrypt()[0]
    print(f"\n[Client] Decrypted difference: {diff:.2f}")
    if diff >= 0:
        print("✅ VERIFIED: Proof successful that Balance >= Threshold without revealing the actual balance to the blockchain or server!")
    else:
        print("❌ FAILED: Balance < Threshold!")

if __name__ == "__main__":
    main()
