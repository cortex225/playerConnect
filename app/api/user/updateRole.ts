import { getSession } from "next-auth/react";
import { prisma } from "@/lib/db";

export default async function handler(req, res) {
    const session = await getSession({ req });
    const role = req.cookies.user_role;

    if (session?.user && role) {
        await prisma.user.update({
            where: { id: session.user.id },
            data: { role },
        });

        // Supprime le cookie après utilisation
        res.setHeader(
            "Set-Cookie",
            `user_role=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
        );

        res.status(200).json({ success: true });
    } else {
        res.status(400).json({ error: "Invalid session or role" });
    }
}
