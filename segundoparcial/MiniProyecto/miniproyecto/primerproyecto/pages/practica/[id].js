import{useRouter} from "next/router";

export default function practica(){
    const router = useRouter();
    const { id } = router.query;

    return(
        <main>
            <h1>Ruta dinamica de practica 1</h1>
            <p>El paramtro capturado por next es:   {id}  </p>
        </main>

    );
}