import Link from "next/link"; 
function GoLogin() {
   
    return (
            <div className="flex-cc mt-4">
                <p>
                    {"已有账号？"}
                    <Link className="text-color"  href={'/login'}></Link>
                </p>
            </div>

    );
}

export default GoLogin;
