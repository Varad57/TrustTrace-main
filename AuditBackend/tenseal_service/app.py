from flask import Flask, request, jsonify
import tenseal as ts
import base64

app = Flask(__name__)

@app.route('/compute_diff', methods=['POST'])
def compute_diff():
    try:
        data = request.json
        context_b64 = data['context']
        balance_b64 = data['balance']
        threshold = float(data['threshold'])

        # Decode from base64
        ctx_bytes = base64.b64decode(context_b64)
        bal_bytes = base64.b64decode(balance_b64)

        # Load TenSEAL objects natively
        ctx = ts.context_from(ctx_bytes)
        enc_bal = ts.lazy_ckks_vector_from(bal_bytes)
        enc_bal.link_context(ctx)

        # Homomorphic Computation (Without Decrypting)
        encrypted_result = enc_bal - [threshold]

        # Serialize and encode
        res_bytes = encrypted_result.serialize()
        res_b64 = base64.b64encode(res_bytes).decode('utf-8')

        return jsonify({"result_vector": res_b64})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
