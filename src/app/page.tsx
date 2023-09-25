import CodeBlock from './_component/CodeBlock';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <p className="text-3xl">Webhook-Er</p>
      <p className="text-xl mt-5 mb-10">It's simple! It's fast! Try it now!</p>
      <CodeBlock
        code={`
          curl --location 'webhook-er.vercel.app/api/webhooks'
          --header 'Content-Type: application/json'
          --data '{
              "webhooks": [
                  {
                      "payload": {
                          "data": "TEST"
                      },
                      "deliveryAddress": "<YOUR_CUSTOM_URL>"
                  }
              ]
          }'
        `}
        language="bash"
      />
    </main>
  );
}
