import { ColumnDef } from "@tanstack/react-table"
import { Category } from "./schema"
import { Button } from "@/components/ui/button"
import { Pencil, Trash } from "lucide-react"

export const columns: ColumnDef<Category>[] = [
    {
        accessorKey: "imageUrl",
        header: "صورة",
        cell: ({ row }) => {
            return (
                <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-100">
                    <img
                        src={row.getValue("imageUrl") || "https://placehold.co/50"}
                        alt={row.getValue("nameEn")}
                        className="h-full w-full object-cover"
                    />
                </div>
            )
        },
    },
    {
        accessorKey: "nameEn",
        header: "الاسم (EN)",
    },
    {
        accessorKey: "nameAr",
        header: "الاسم (AR)",
        cell: ({ row }) => <div className="font-medium">{row.getValue("nameAr")}</div>,
    },
    {
        accessorKey: "status",
        header: "الحالة",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold
          ${status === 'active' ? 'bg-green-100 text-green-700' :
                        status === 'inactive' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'
                    }
        `}>
                    {status === 'active' ? 'نشط' : status === 'inactive' ? 'غير نشط' : 'مؤرشف'}
                </span>
            )
        },
    },
    {
        id: "actions",
        cell: () => {


            return (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            )
        },
    },
]
