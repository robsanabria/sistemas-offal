'use client'

import { useState, useEffect } from 'react'
import { Tv, RefreshCw, Image as ImageIcon, MessageSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Quote {
    text: string
    character: string
    image?: string
}

const CHARACTER_IMAGES: Record<string, string> = {
    'Homero': 'https://static.wikia.nocookie.net/simpsons/images/b/bd/Homer_Simpson.png',
    'Bart': 'https://static.wikia.nocookie.net/simpsons/images/6/65/Bart_Simpson.png',
    'Lisa': 'https://static.wikia.nocookie.net/simpsons/images/e/ec/Lisa_Simpson.png',
    'Mr. Burns': 'https://static.wikia.nocookie.net/simpsons/images/a/a9/Charles_Montgomery_Burns.png',
    'Marge': 'https://static.wikia.nocookie.net/simpsons/images/4/4d/Marge_Simpson.png',
    'Abuelo': 'https://static.wikia.nocookie.net/simpsons/images/a/a9/Abraham_Simpson.png',
    'Milhouse': 'https://static.wikia.nocookie.net/simpsons/images/1/11/Milhouse_Van_Houten.png',
}

const SPECIAL_GIFS = [
    "https://media2.giphy.com/media/v1.Y2lkPTZjMDliOTUydWdzOXd0bjFxYTBuOW9vZTNqY2M0emo3OHIwZGJ0NzJpbWxkb2lxbiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l2JdZtu84rJXb9c8o/200w.gif", // Principal: Homer Any Key
    "https://i.redd.it/qboh3972puqd1.gif",
    "https://i.pinimg.com/originals/c0/e7/25/c0e725b9bbebf4c619e629052eec1e23.gif",
    "https://media.tenor.com/psbwu8eFzQgAAAAM/out-of-gas-gas.gif",
    "https://media.tenor.com/RjwtwZ-_-JUAAAAM/bart-simpson.gif",
    "https://pbs.twimg.com/media/EBKuywlX4AURgWU.jpg",
    "https://pbs.twimg.com/media/GUt6Z_iWQAI56rA.jpg",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzYExKduvZqBt16oKLWrIos3fvJX0tq4a-Jw&s",
    "https://media2.giphy.com/media/v1.Y2lkPTZjMDliOTUyazU0bWVrMXRjd3k2NWFzMWp3aXJzM2hhdjZwZDY4eHVuMG90aDYzMiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xT5LMPL6QwfuOuh87m/200w.gif",
    "https://media0.giphy.com/media/v1.Y2lkPTZjMDliOTUyZ3VvNHk3aWhtdTFlb2MwMXJseGNoaDlocmt4NTFuZHBuemJuOTl5ZCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/NnJib5EkPyym4/giphy.gif",
    "https://media0.giphy.com/media/v1.Y2lkPTZjMDliOTUyYmUzemluZnR3NXBjeGN0MDduampnMnFvc3Nnd21xMm96NmFieXdraiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3orif75hTF6XTFLCec/200.gif",
    "https://media2.giphy.com/media/v1.Y2lkPTZjMDliOTUyYWJ4cGZnOWh0cHBicDBmNzE1bms4dTd3dGJudXplbW9scjRhdDFkeiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l2Je3qbcjNTQTrttK/200_s.gif",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpuxRVSUnRgirPv6eJX9yPQ34DHnU9TW0e4A&s",
    "https://i.pinimg.com/originals/e6/c2/7c/e6c27cf9e485e94fe1b6f66ec2b93ad2.gif",
    "https://i.makeagif.com/media/5-21-2016/9n77Ld.gif",
    "https://64.media.tumblr.com/tumblr_m1gsqzxpi71r3ifxzo2_250.gif",
    "https://64.media.tumblr.com/tumblr_m1gsqzxpi71r3ifxzo4_250.gif",
    "https://media1.giphy.com/media/v1.Y2lkPTZjMDliOTUybWo3MjFzZXNweXJxYXNpeWYxYWtneGFpaG8xbWM3MmlydmxrZmlhbCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/12aE8P2bggzEMo/200w.gif",
    "https://media.tenor.com/Q8iaxDDV_soAAAAM/barney-gumble-barney.gif",
    "https://media.tenor.com/QIVMAlYK6qEAAAAM/moe-barney.gif",
    "https://preview.redd.it/favourite-scream-in-the-show-v0-0ieiyjss82dd1.jpeg?auto=webp&s=6f0eee9a83900a98c36540d1de5e3c868a2537d0",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0fSeapev-8gGiE_QSfVmwVHejFvPS6Y_DYw&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_0R1HULe5kYUj61qons17TVe-tTUEgyrrFw&s",
    "https://giffiles.alphacoders.com/145/145641.gif",
    "https://media.tenor.com/FONxY8wz-ccAAAAe/simpsons-more-asbestos.png",
    "https://media4.giphy.com/media/v1.Y2lkPTZjMDliOTUyZW14bzZla2Q4dTlrcHIzNWF1dDBmbHFyZmI3ZTl0bDNsYW1pMmxtNiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xT5LMyWjcueSDNuHaE/giphy.gif",
    "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExeGJwejMxN2hjMWhlbXp5aXFieW01ZGo4cXlmcHltb3VmNDFibWNjeSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/EMWSx9UhURA9a/giphy.gif",
    "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExdXltOG4xdXUxdG5paWl6aWh2aWgzZXZxMDMzZHFudGxrY3l0dzh1eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT5LMricZHEeAOQtcA/giphy.gif",
    "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExanY0eWx0OXVkcWZqcXp6b2RuNnN4bXpyY2J4NHg3a2l5cHpnMmVtMCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o6MbhgBx0MaN0nOr6/giphy.gif",
    // user-added GIFs
    "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExd245amsxYTg3M3k3MXlvdDkxbDhtYzNxNWxzZHg3ajNueWZzaGl1MiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/citBl9yPwnUOs/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3Z2wyc2hzdWVnaWhyN3ZqejU4ejFqdDg5MGhicXp6dDZmamJ4OWo3cSZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/l2Je6mZM3COfD3ueI/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3Z2wyc2hzdWVnaWhyN3ZqejU4ejFqdDg5MGhicXp6dDZmamJ4OWo3cSZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/3o6Mbi3TYofmzfvqZW/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3Z2wyc2hzdWVnaWhyN3ZqejU4ejFqdDg5MGhicXp6dDZmamJ4OWo3cSZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/fJKG1UTK7k64w/giphy.gif",
    "https://preview.redd.it/got-some-simpsons-gifs-and-you-dont-know-what-to-do-with-v0-00lp5bpadmwd1.gif?width=480&auto=webp&s=508b3642ee900daa3dfd7965b699bc545dbb99be",
    "https://media2.giphy.com/media/yUb1EBeo2TzJC/giphy.gif",
    "https://media.licdn.com/dms/image/v2/C4E12AQGrFaSBLj69Ug/article-inline_image-shrink_400_744/article-inline_image-shrink_400_744/0/1605181241552?e=1773273600&v=beta&t=FnaKReoxWesr8O1OSpTggNk4CGLLA016CjZvku2uDVk",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIPVC-vsKJ_2CX9gJswcz64NcGrnJNFr7sVA&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSc3ni0CPep_n0shA7590mgamHQqsd9p5VXNw&s",
    "https://64.media.tumblr.com/a867fda74d117e8afc28532b8d348ef3/511aa1048e6b62a4-92/s500x750/7372b9c078066585a271139f253fa421e0a4b0a9.gif",
    "https://st1.uvnimg.com/cc/6e/0e58cae947d19fa40d5866f556d3/giphy-8.gif",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjzkSyqIXHjYZzXfF8C73q_TeAY2qSMf_-FA&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRR2Q6QVkN9EIZrpEUyWVTBY1a4nM33-7sXg&s",
    "https://i1.wp.com/www.rowsdowr.com/wp-content/uploads/2012/10/homers-web-page.gif?resize=500%2C320",
    "https://socialgeek.co/wp-content/uploads/2016/05/1215965.gif",
    "https://media.tenor.com/1Dzquj-cHXEAAAAM/love-mr-burns.gif",
    "https://media.tenor.com/vpjVqycO-joAAAAM/mr-snrub-snrub.gif",
    "https://media1.giphy.com/media/v1.Y2lkPTZjMDliOTUycHhpaGxhNXkxbmg3NGxrOWw4OW1lNnpianl4ejM4eTJoNzI0dGVtZyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xT5LMQpMdH5Jxd86Mo/200w.gif",
    "https://media1.tenor.com/m/IF4XB3Y6ibAAAAAd/burns-mr-burns.gif",
    "https://media1.tenor.com/m/mpkBPJSrvT0AAAAd/burns.gif",
    "https://media1.tenor.com/m/X9DOIQsD2RQAAAAC/burns-bolos.gif",
    "https://media1.tenor.com/m/UU1WgBzGTioAAAAC/mr-burns.gif",
    "https://i.redd.it/d5mj2s0uu0of1.gif",
    "https://media.tenor.com/O2Uxw9ZgceMAAAAM/mr-burns-yes.gif",
    "https://media.tenor.com/DQ76Av1qnlgAAAAM/burns-smither.gif",
    "https://i0.wp.com/media1.giphy.com/media/GN8qAUQg1pj5S/giphy.gif",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQG17puX6hRlZ_8vUKR8qXQczWD1LmgdbKjA&s",
    "https://media4.giphy.com/media/v1.Y2lkPTZjMDliOTUyM2NlNmJnOWh3MHBwOXB0bGo0Yzc1OWZkMXBndDZlNWdqb2JlYnk1dCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3o6MbdrDd2IQtjAsxy/200w.gif",
    "https://media.tenor.com/LastAXVnClMAAAAM/simpsons-mr-burns.gif",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSB4RlKDV8hglEuzD8w1SO_xzmywq2D8GIPmQ&s",
    "https://media.tenor.com/1uVzx6DxrB8AAAAM/hot-take-mr-burns.gif",
    "https://comb.io/S3SGbx.gif"
]

const SIMPSONS_QUOTES: Quote[] = [
    { text: "Oyee, ¿significa que seré un fracasado? - SI, hijo. UN FRACASADO ESPECTACULAR", character: "Bart / Homero" },
    { text: "Ahh, soy un pastelito horneado de canela", character: "Homero" },
    { text: "A la grande le puse Cuca", character: "Homero", image: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZkMThidWpxZGZ6ZGZ6ZGZ6ZGZ6ZGZ6ZGZ6ZGZ6ZGZ6ZGZ6ZGZ6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o6Mb86C908wL0QWfC/giphy.gif" },
    { text: "¡Matanga!", character: "Homero" },
    { text: "¡Ahhhh! ¿que se le va a hacer?", character: "Homero" },
    { text: "¡Eso digo yo... pero así está la cosa!", character: "Homero" },
    { text: "He llegado a odiar mi propia creación, ahora se cómo se siente Dios", character: "Homero" },
    { text: "¡Qué bien, a cenar!; la pausa perfecta entre el trabajo y la ebriedad", character: "Homero" },
    { text: "No soy un hombre de plegarias, pero si estás en el cielo... ¡SÁLVAME POR FAVOR, SUPERMAN!", character: "Homero" },
    { text: "!Alá, Jesús, Buda... los amo a todos!", character: "Homero" },
    { text: "¡Qué suerte Marge!, nuestros hijos son cada vez más inteligentes, si tenemos otro podría construir una máquina del tiempo para viajar al pasado y no tener hijos", character: "Homero" },
    { text: "¡Que feo canta que no hay Dragon ball Z!", character: "Homero" },
    { text: "Por favor, no me coma señor extraterrestre, tengo una esposa y tres hijos..., cómaselos a ellos", character: "Homero" },
    { text: "¡Ahhhh, Marge, no te voy a mentir!... ¡Adios!", character: "Homero" },
    { text: "¿Un Gym?¿Qué es un gym? ¡Ah, un gym!", character: "Homero" },
    { text: "Moe, sírveme algo fuerte como para olvidar que las odio, pero no tanto como para creer que las quiero", character: "Homero" },
    { text: "Ese molino deja de funcionar pero mi cerebro no... lo hace", character: "Homero" },
    { text: "En mi familia somos 5 personas: Marge, Bart, la niña Bart, la que nunca habla y el tipo gordo, como lo desprecio", character: "Homero" },
    { text: "No voy a ignorar a papá por el resto de mi vida; sólo lo voy a ignorar por el resto de su vida", character: "Bart" },
    { text: "¡Ella conoce mi única debilidad, ser débil!", character: "Homero" },
    { text: "Marge, eres tan hermosa como la Princesa Leia y tan inteligente como Yoda", character: "Homero" },
    { text: "Siii... las cosas buenas no acaban con 'eo'... acaban con 'manía' o 'tería'.", character: "Homero" },
    { text: "¡Ay, que digo, Tú estás en todas partes Señor, eres omnívoro!", character: "Homero" },
    { text: "La televisión da mucho y pide poco.", character: "Homero" },
    { text: "Si Bart es El Barto, ¡yo puedo ser El Homo!", character: "Homero" },
    { text: "¡Ay, no, no, no... si no lo veo no es ilegal!", character: "Homero" },
    { text: "Ya me conoces, Marge, me gusta la cerveza fría, la tele fuerte y los homosexuales, ¡Locas, locas... siiiii!", character: "Homero" },
    { text: "Marge, creo que odio a Michael Jackson. No, no, la verdad es que canta bien y es noble, buenas noches", character: "Homero" },
    { text: "¡Estupido como un ZORRO!", character: "Homero" },
    { text: "¡Jaque mate doña cama elástica!", character: "Homero" },
    { text: "¡Que elegancia la de Francia!", character: "Homero" },
    { text: "¡Estupido y sensual Flanders!", character: "Homero" },
    { text: "¡No se rían de mi, pueden tener un hijo igual!", character: "Homero" },
    { text: "Bart, no quiero asustarte, pero tal vez el coco, EL COCO está en la casa!", character: "Homero" },
    { text: "Tranquilos, sé lo que hay que hacer en estos casos...JUMANJIIII!!!!!", character: "Homero" },
    { text: "Marge mi reina, Lisa mi pequeña princesita... y como olvidar el niño rata", character: "Homero" },
    { text: "¡Por el alcohol.... CAUSA y SOLUCION de todos los problemas de la vida!", character: "Homero" },
    { text: "A-tó-mico.... se dice A-tó-mico...", character: "Homero" },
    { text: "¡Salvame Jebus!", character: "Homero" },
    { text: "Yo no fui, nadie me vio, nadie puede probarlo.", character: "Bart" },
    { text: "¡SOY LA REINA LAGARTO!", character: "Lisa" },
    { text: "Excelente...", character: "Mr. Burns" },
    { text: "¡Hola, soy el Señor Bolainas y vengo de un lugar muy lejano!", character: "Homero" }
]

export default function SimpsonsQuote() {
    const [content, setContent] = useState<{ type: 'quote' | 'gif', data: any } | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchGiphyGif = async () => {
        try {
            // Using GIPHY public beta key dc6zaTOxFJmzC
            const res = await fetch(`https://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=the-simpsons&rating=g`)
            const json = await res.json()

            if (json.data && json.data.images && json.data.images.original) {
                return json.data.images.original.url
            }
            throw new Error("Invalid Giphy response structure")
        } catch (e) {
            console.error("Giphy fetch failed", e)
            // Fallback to special gifs array
            return SPECIAL_GIFS[Math.floor(Math.random() * SPECIAL_GIFS.length)]
        }
    }

    const getRandomContent = async () => {
        setLoading(true)

        // 60% chance for quote, 40% for gif
        if (Math.random() > 0.4) {
            const randomIndex = Math.floor(Math.random() * SIMPSONS_QUOTES.length)
            setContent({ type: 'quote', data: SIMPSONS_QUOTES[randomIndex] })
            setLoading(false)
        } else {
            const gifUrl = await fetchGiphyGif()
            setContent({ type: 'gif', data: gifUrl })
            setLoading(false)
        }
    }

    useEffect(() => {
        getRandomContent()
    }, [])

    const getCharacterImage = (char: string) => {
        if (char.includes('Homero')) return CHARACTER_IMAGES['Homero']
        if (char.includes('Bart')) return CHARACTER_IMAGES['Bart']
        if (char.includes('Lisa')) return CHARACTER_IMAGES['Lisa']
        if (char.includes('Burns')) return CHARACTER_IMAGES['Mr. Burns']
        if (char.includes('Marge')) return CHARACTER_IMAGES['Marge']
        if (char.includes('Abuelo')) return CHARACTER_IMAGES['Abuelo']
        if (char.includes('Milhouse')) return CHARACTER_IMAGES['Milhouse']
        return CHARACTER_IMAGES['Homero']
    }

    return (
        <div className="cyber-card flex flex-col gap-4 overflow-hidden min-h-[350px]">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2 text-yellow-400">
                    <Tv size={20} />
                    <h3 className="font-bold uppercase tracking-widest text-sm italic">Todo el maldito sistema esta maaal! 📺</h3>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[10px] text-zinc-600 font-mono">
                        {content?.type === 'quote' ? <MessageSquare size={10} /> : <ImageIcon size={10} />}
                        <span>{content?.type?.toUpperCase()}</span>
                    </div>
                    <button
                        onClick={getRandomContent}
                        disabled={loading}
                        className="p-1.5 hover:bg-zinc-800 rounded-md transition-all active:scale-95 border border-zinc-800 hover:border-yellow-500/50"
                        title="Siguiente"
                    >
                        <RefreshCw size={18} className={`${loading ? 'animate-spin text-yellow-400' : 'text-zinc-500'}`} />
                    </button>
                </div>
            </div>

            <div className="relative flex-1 bg-black/60 rounded-lg overflow-hidden flex flex-col border border-zinc-800/50 group">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loader"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center bg-zinc-950"
                        >
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
                                <div className="text-yellow-500/50 font-mono text-[10px] animate-pulse tracking-tighter uppercase">
                                    Sintonizando...
                                </div>
                            </div>
                        </motion.div>
                    ) : content ? (
                        <motion.div
                            key={content.type === 'quote' ? content.data.text : content.data}
                            initial={{ opacity: 0, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col h-full"
                        >
                            {content.type === 'gif' ? (
                                <div className="relative w-full h-full flex items-center justify-center p-2 bg-zinc-950">
                                    <img
                                        src={content.data}
                                        alt="Simpsons Moment"
                                        className="max-w-full max-h-full object-contain rounded shadow-2xl"
                                    />
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-[10px] bg-black/80 text-white px-2 py-1 rounded-full font-mono border border-white/10 uppercase tracking-tighter">
                                            Momento Icónico
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col md:flex-row h-full items-center p-6 gap-6">
                                    <div className="relative w-28 h-28 flex-shrink-0 bg-yellow-400/5 rounded-full border border-yellow-400/20 p-2 flex items-center justify-center overflow-visible">
                                        <img
                                            src={getCharacterImage(content.data.character)}
                                            alt={content.data.character}
                                            className="w-24 h-24 object-contain filter drop-shadow-[0_0_15px_rgba(234,179,8,0.2)] hover:scale-110 transition-transform"
                                        />
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping opacity-20" />
                                    </div>

                                    <div className="flex-1 flex flex-col justify-center text-center md:text-left">
                                        <span className="text-yellow-500/50 text-[10px] uppercase font-mono mb-2 tracking-widest block">
                                            {content.data.character} dice:
                                        </span>
                                        <p className="text-lg md:text-2xl font-black text-white leading-tight tracking-tight italic">
                                            "{content.data.text}"
                                        </p>

                                        {content.data.image && (
                                            <div className="mt-4 rounded border border-zinc-800 overflow-hidden max-w-[200px]">
                                                <img src={content.data.image} alt="Context" className="w-full grayscale hover:grayscale-0 transition-all cursor-crosshair" />
                                            </div>
                                        )}

                                        <div className="mt-4 flex items-center gap-2">
                                            <div className="h-[1px] flex-1 bg-zinc-800" />
                                            <span className="text-[9px] text-zinc-600 font-mono uppercase tracking-tighter">Sistemicos-Simpsons HQ</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>

            <p className="text-[9px] text-zinc-700 text-center font-mono italic">
                "Dame las drogas Lisa."
            </p>
        </div>
    )
}
